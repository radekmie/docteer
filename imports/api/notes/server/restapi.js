// @flow

import {InvalidArgumentError} from 'restify-errors';
import {UnauthorizedError} from 'restify-errors';

import {MongoInternals} from 'meteor/mongo';

import {Notes} from '.';
import {NotesArchive} from '.';

const ObjectId = MongoInternals.NpmModules.mongodb.module.ObjectId;

Notes.register = function register(server, context) {
  context.ajv.addSchema({
    id: 'GET /notes',
    type: 'object',
    required: ['authorization'],
    properties: {
      authorization: {
        type: 'object',
        required: ['basic'],
        properties: {
          basic: {
            type: 'object',
            required: ['password', 'username'],
            properties: {
              password: {
                type: 'string'
              },
              username: {
                type: 'string'
              }
            }
          }
        }
      },
      query: {
        type: 'object',
        required: [],
        properties: {
          refresh: {
            type: 'number'
          }
        },
        additionalProperties: false
      }
    }
  });

  context.ajv.addSchema({
    id: 'POST /notes',
    type: 'object',
    required: ['authorization', 'body', 'query'],
    properties: {
      authorization: {
        type: 'object',
        required: ['basic'],
        properties: {
          basic: {
            type: 'object',
            required: ['password', 'username'],
            properties: {
              password: {
                type: 'string'
              },
              username: {
                type: 'string'
              }
            }
          }
        }
      },
      body: {
        type: 'object',
        required: ['created', 'removed', 'updated'],
        properties: {
          created: {
            type: 'array',
            items: {
              type: 'string'
            }
          },
          removed: {
            type: 'array',
            items: {
              type: 'string'
            }
          },
          updated: {
            type: 'array',
            items: {
              type: 'object',
              required: ['_id'],
              properties: {
                _id: {
                  type: 'string'
                },
                _outline: {
                  type: 'object'
                },
                _outname: {
                  type: 'string'
                }
              }
            }
          }
        },
        additionalProperties: false
      },
      query: {
        type: 'object',
        required: [],
        properties: {
          refresh: {
            type: 'number'
          }
        },
        additionalProperties: false
      }
    }
  });

  server.get('/notes', (req, res, next) => {
    context.ajv.validate('GET /notes', req);

    if (context.ajv.errors) return next(new InvalidArgumentError());

    const userId = context.authenticate(req);

    if (userId === null) return next(new UnauthorizedError());

    res.send(notesByUser(userId, req.query.refresh));

    return next();
  });

  server.post('/notes', (req, res, next) => {
    context.ajv.validate('POST /notes', req);

    if (context.ajv.errors) {
      return next(
        new InvalidArgumentError(
          [context.ajv.errors[0].dataPath, context.ajv.errors[0].message].join(
            ' '
          )
        )
      );
    }

    const userId = context.authenticate(req);

    if (userId === null) return next(new UnauthorizedError());

    notesPatch(req.body, userId);
    res.send(notesByUser(userId, req.query.refresh));
    if (req.body.removed.length) notesArchive();

    return next();
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
      {_id_user: userId, _updated: {$gt: refresh}},
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
};
