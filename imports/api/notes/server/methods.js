// @flow

import SimpleSchema from 'simpl-schema';

import {Meteor} from 'meteor/meteor';
import {MongoInternals} from 'meteor/mongo';

import {NotesArchive} from '.';
import {Notes} from '.';

const ObjectId = MongoInternals.NpmModules.mongodb.module.ObjectId;

const endpoint = (name, {handle, schema: definition}) => {
  const schema = new SimpleSchema(definition);

  Meteor.methods({
    [name](data) {
      if (!this.userId) throw new Meteor.Error('not-authorized');

      schema.clean(data, {mutate: true});
      schema.validate(data);

      return handle.call(this, data);
    }
  });
};

endpoint('GET /notes', {
  handle({refresh}) {
    return notesByUser(this.userId, refresh);
  },

  schema: {
    refresh: {
      type: Number,
      optional: true,
      min: 0
    }
  }
});

endpoint('POST /notes', {
  handle({patch, refresh}) {
    notesPatch(patch, this.userId);

    const notes = notesByUser(this.userId, refresh);

    if (patch.removed.length) notesArchive();

    return notes;
  },

  schema: {
    patch: Object,

    'patch.created': Array,

    'patch.created.$': String,

    'patch.removed': Array,

    'patch.removed.$': String,

    'patch.updated': Array,

    'patch.updated.$': {
      type: Object,
      blackbox: true
    },

    'patch.updated.$._id': String,

    'patch.updated.$._outline': {
      type: Object,
      optional: true,
      blackbox: true
    },

    'patch.updated.$._outname': {
      type: String,
      optional: true
    },

    refresh: {
      type: Number,
      optional: true,
      min: 0
    }
  }
});

function notesArchive() {
  const archive = Notes.find({_removed: {$ne: null}}).map(note =>
    Object.assign(note, {_id: new ObjectId(note._id._str)})
  );

  if (archive.length === 0) return;

  const $in = archive.map(note => note._id);

  NotesArchive.rawCollection()
    .insertMany(archive)
    .await();
  Notes.rawCollection()
    .deleteMany({_id: {$in}})
    .await();
}

function notesByUser(userId, after) {
  const refresh = new Date(after || 0);
  const fields = {
    _id: 0,
    _id_user: 0,
    _updated: 0,
    _version: 0
  };

  const diff = {created: [], removed: [], updated: []};

  Notes.find(
    {_id_user: userId, ...(after && {_updated: {$gt: refresh}})},
    {fields}
  ).forEach(note => {
    note._id = note._id_slug;

    if (note._removed > refresh) diff.removed.push(note._id);
    else {
      diff.updated.push(note);

      if (note._created > refresh) diff.created.push(note._id);
    }

    delete note._id_slug;
    delete note._created;
    delete note._removed;
  });

  return diff;
}

function notesPatch(patch, userId) {
  if (!patch.created.length && !patch.removed.length && !patch.updated.length)
    return;

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

  Notes.rawCollection()
    .bulkWrite(bulk)
    .await();
}
