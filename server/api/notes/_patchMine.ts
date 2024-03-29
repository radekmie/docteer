import { AnyBulkWriteOperation } from 'mongodb';

import * as api from '..';
import { APIContextType, NoteDocType, PatchType } from '../../../types';
import { method } from '../../lib';
import * as schemas from '../../schemas';

type Params = { patch: PatchType; refresh: number };

async function handle({ patch, refresh }: Params, context: APIContextType) {
  const now = context.now;
  const bulk: AnyBulkWriteOperation<NoteDocType>[] = [];

  patch.removed.forEach(_id => {
    bulk.push({
      updateOne: {
        filter: { _id_slug: _id, _id_user: context.userId },
        update: { $set: { _removed: now, _updated: now } },
      },
    });
  });

  patch.updated.forEach(doc => {
    const _id = doc._id;
    const _outline = doc._outline;
    const _outname = doc._outname;

    if (patch.removed.includes(_id)) {
      return;
    }

    for (const key in doc) {
      if (key.startsWith('_')) {
        delete doc[key];
      }
    }

    if (Object.keys(doc).length === 0) {
      return;
    }

    if (patch.created.includes(_id)) {
      bulk.push({
        insertOne: {
          document: {
            // ID
            _id_slug: _id,
            _id_user: context.userId,

            // Dates
            _created: now,
            _removed: null,
            _updated: now,

            // Data
            _objects: doc,

            // Type
            _outname,
            _outline,

            // History
            _version: [{ _updated: now, _objects: doc, _outname, _outline }],
          },
        },
      });
    } else {
      bulk.push({
        updateOne: {
          filter: { _id_slug: _id, _id_user: context.userId },
          update: {
            $set: {
              _updated: now,
              ...(_outname ? { _outname } : {}),
              ...(_outline ? { _outline } : {}),
              ...Object.entries(doc).reduce(
                (doc, [key, value]) =>
                  Object.assign(doc, { [`_objects.${key}`]: value }),
                {},
              ),
            },
            $push: {
              _version: {
                _updated: now,
                _objects: doc,
                ...(_outname ? { _outname } : {}),
                ...(_outline ? { _outline } : {}),
              },
            },
          },
        },
      });
    }
  });

  if (bulk.length !== 0) {
    const { Notes } = context.collections;
    await Notes.bulkWrite(bulk, { session: context.session });
  }

  return await api.notes.getMine.run({ refresh }, context);
}

const schema = {
  type: 'object',
  properties: {
    patch: schemas.patch,
    refresh: { type: 'integer', minimum: 0 },
  },
  required: ['patch', 'refresh'],
  additionalProperties: false,
};

export const patchMine = method(handle, schema);
