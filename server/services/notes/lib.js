// @flow

import {Meteor} from 'meteor/meteor';
import {MongoInternals} from 'meteor/mongo';
import {Mongo} from 'meteor/mongo';

import type {NoteDocType} from '../../../imports/types.flow';

type NotesType = Meteor$Mongo$Collection<NoteDocType<{||}>>;

const ObjectId = MongoInternals.NpmModules.mongodb.module.ObjectId;

// prettier-ignore
export const Notes:        NotesType = new Mongo.Collection('notes');
export const NotesArchive: NotesType = new Mongo.Collection('notes-archive');

Meteor.startup(() => {
  Notes._ensureIndex({_id_user: 1, _id_slug: 1}, {unique: true});
  Notes._ensureIndex({_id_user: 1, _updated: 1});
  Notes._ensureIndex({_removed: 1});
});

export function archive() {
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

export function byUser(userId: string, after: number): PatchType<*, *, *> {
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
    if (_removed && _removed > refresh) diff.removed.push(_id_slug);
    else {
      diff.updated.push({_id: _id_slug, ...note});

      if (_created > refresh) diff.created.push(_id_slug);
    }
  });

  return diff;
}

export function patch(patch: PatchType<*, *, *>, userId: string) {
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
