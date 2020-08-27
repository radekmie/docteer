import { APIContextType, PatchType } from '../../../types';
import { method } from '../../lib';

type Params = { refresh: number };

async function handle({ refresh }: Params, context: APIContextType) {
  const result = {
    patch: { created: [], removed: [], updated: [] } as PatchType,
    refresh: +context.now,
  };

  // There's no newer data.
  if (refresh >= result.refresh) {
    return result;
  }

  const after = new Date(refresh);
  const check = (collection: 'Notes' | 'NotesArchive', projection: object) =>
    context.collections[collection]
      .find(
        { _id_user: context.userId, _updated: { $gt: after } },
        { projection, session: context.session },
      )
      .forEach(note => {
        if (note._removed && note._removed > after) {
          result.patch.removed.push(note._id_slug);
        } else {
          result.patch.updated.push({
            _id: note._id_slug,
            _outname: note._outname,
            _outline: note._outline,
            ...note._objects,
          });

          if (note._created > after) {
            result.patch.created.push(note._id_slug);
          }
        }
      });

  await Promise.all([
    check('Notes', { _id: 0, _id_user: 0, _updated: 0, _version: 0 }),
    refresh > 0
      ? check('NotesArchive', { _id: 0, _id_slug: 1, _removed: 1 })
      : null,
  ]);

  return result;
}

const schema = {
  type: 'object',
  properties: {
    refresh: { type: 'integer', minimum: 0 },
  },
  required: ['refresh'],
  additionalProperties: false,
};

export const getMine = method(handle, schema);
