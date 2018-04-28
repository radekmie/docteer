// @flow

import {MongoInternals} from 'meteor/mongo';

import {NotesArchive} from '.';
import {Notes} from '.';
import {endpoint} from '../../lib';

import type {PatchType} from '../../../types.flow';

const ObjectId = MongoInternals.NpmModules.mongodb.module.ObjectId;

endpoint('GET /notes', {
  schema: {
    refresh: {
      type: Number,
      optional: true,
      min: 0
    }
  },

  handle({refresh}: {|refresh: number|}): PatchType<*, *, *> {
    return notesByUser(this.userId, refresh);
  }
});

endpoint('POST /notes', {
  schema: {
    patch: Object,
    'patch.created': Array,
    'patch.created.$': String,
    'patch.removed': Array,
    'patch.removed.$': String,
    'patch.updated': Array,
    'patch.updated.$': {type: Object, blackbox: true},
    'patch.updated.$._id': String,
    'patch.updated.$._outline': {type: Object, optional: true, blackbox: true},
    'patch.updated.$._outname': {type: String, optional: true},
    refresh: {
      type: Number,
      optional: true,
      min: 0
    }
  },

  async handle({
    patch,
    refresh
  }: {|
    patch: PatchType<*, *, *>,
    refresh: number
  |}): Promise<PatchType<*, *, *>> {
    await notesPatch(patch, this.userId);

    const notes = notesByUser(this.userId, refresh);

    if (patch.removed.length) await notesArchive();

    return notes;
  }
});

function notesArchive() {
  const archive = Notes.find({_removed: {$ne: null}}).map(note =>
    Object.assign(note, {_id: new ObjectId(note._id._str)})
  );

  if (archive.length === 0) return Promise.resolve();

  const $in = archive.map(note => note._id);

  return Promise.all([
    Notes.rawCollection().deleteMany({_id: {$in}}),
    NotesArchive.rawCollection().insertMany(archive)
  ]);
}

function notesByUser(userId: string, after: number): PatchType<*, *, *> {
  const refresh = new Date(after || 0);
  const fields = {
    _id: 0,
    _id_user: 0,
    _updated: 0,
    _version: 0
  };

  const diff: PatchType<*, *, *> = {created: [], removed: [], updated: []};

  Notes.find(
    {_id_user: userId, ...(after ? {_updated: {$gt: refresh}} : {})},
    {fields}
  ).forEach(({_id_slug, _created, _removed, ...note}) => {
    if (_removed && _removed > refresh)
      diff.removed.push(_id_slug);
    else {
      diff.updated.push({_id: _id_slug, ...note});

      if (_created > refresh) diff.created.push(_id_slug);
    }
  });

  return diff;
}

function notesPatch(patch: PatchType<*, *, *>, userId: string) {
  if (!patch.created.length && !patch.removed.length && !patch.updated.length)
    return Promise.resolve();

  const now = new Date();
  const bulk = [];

  patch.removed.forEach(_id => {
    bulk.push({
      updateOne: {
        filter: {_id_slug: _id, _id_user: userId},
        update: {$set: {_removed: now, _updated: now}}
      }
    });
  });

  patch.updated.forEach(doc => {
    const _id = doc._id;
    const _outline = doc._outline;
    const _outname = doc._outname;

    if (patch.removed.includes(_id)) return;

    for (const key in doc) {
      if (key.slice(0, 1) === '_') delete doc[key];
    }

    if (Object.keys(doc).length === 0) return;

    if (patch.created.includes(_id)) {
      bulk.push({
        insertOne: {
          document: {
            // ID
            _id_slug: _id,
            _id_user: userId,

            // Type
            _outline,
            _outname,

            // Dates
            _created: now,
            _removed: null,
            _updated: now,

            // History
            _version: [{_created: now, _outline, _outname, ...doc}],

            // Data
            ...doc
          }
        }
      });
    } else {
      bulk.push({
        updateOne: {
          filter: {_id_slug: _id, _id_user: userId},
          update: {
            $set: {
              _updated: now,
              ...(_outline && {_outline}),
              ...(_outname && {_outname}),
              ...doc
            },
            $push: {
              _version: {
                _created: now,
                ...(_outline && {_outline}),
                ...(_outname && {_outname}),
                ...doc
              }
            }
          }
        }
      });
    }
  });

  return Notes.rawCollection().bulkWrite(bulk);
}
