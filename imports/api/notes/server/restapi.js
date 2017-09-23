// @flow

import {InvalidArgumentError} from 'restify-errors';

import {Promise} from 'meteor/promise';

import {Notes} from '..';

Notes.register = function register (server, context) {
  context.ajv.addSchema({
    id: 'GET /notes',
    type: 'object',
    required: [
      'authorization'
    ],
    properties: {
      authorization: {
        type: 'object',
        required: [
          'basic'
        ],
        properties: {
          basic: {
            type: 'object',
            required: [
              'password',
              'username'
            ],
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
    required: [
      'authorization',
      'body',
      'query'
    ],
    properties: {
      authorization: {
        type: 'object',
        required: [
          'basic'
        ],
        properties: {
          basic: {
            type: 'object',
            required: [
              'password',
              'username'
            ],
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
        required: [
          'created',
          'removed',
          'updated'
        ],
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
              required: [
                '_id'
              ],
              properties: {
                _id: {
                  type: 'string'
                },
                _outline: {
                  type: 'object'
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

  server.get('/notes', async (req, res, next) => {
    context.ajv.validate('GET /notes', req);

    if (context.ajv.errors) {
      return next(new InvalidArgumentError([
        context.ajv.errors[0].dataPath,
        context.ajv.errors[0].message
      ].join(' ')));
    }

    if (context.authenticate(req.authorization)) {
      res.send(notesByUser(req.authorization.basic.username, req.query.refresh));
    } else {
      res.send({created: [], removed: [], updated: []});
    }

    return next();
  });

  server.post('/notes', async (req, res, next) => {
    context.ajv.validate('POST /notes', req);

    if (context.ajv.errors) {
      return next(new InvalidArgumentError([
        context.ajv.errors[0].dataPath,
        context.ajv.errors[0].message
      ].join(' ')));
    }

    if (context.authenticate(req.authorization)) {
      bulkPatch(Notes, req.body, req.authorization.basic.username).await();

      res.send(notesByUser(req.authorization.basic.username, req.query.refresh));
    } else {
      res.send({created: [], removed: [], updated: []});
    }

    return next();
  });

  function bulkPatch (collection, patch, userId) {
    if (!patch.created.length && !patch.removed.length && !patch.updated.length)
      return Promise.resolve();

    const now = new Date();

    const hand = collection.rawCollection();
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
      const _id      = doc._id;
      const _outline = doc._outline;

      if (patch.removed.includes(_id))
        return;

      for (const key in doc)
        if (key.slice(0, 1) === '_')
          delete doc[key];

      if (Object.keys(doc).length === 0)
        return;

      if (patch.created.includes(_id)) {
        bulk.push({
          insertOne: {
            document: {
              // ID
              _id_slug: _id,
              _id_user: userId,

              // Type
              _outline,

              // Dates
              _created: now,
              _removed: null,
              _updated: now,

              // History
              _version: [{_created: now, ...doc}],

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
              $set:             {_updated: now, ...doc},
              $push: {_version: {_created: now, ...doc}}
            }
          }
        });
      }
    });

    return hand.bulkWrite(bulk);
  }

  function notesByUser (userId, after) {
    const refresh = new Date(after || 0);
    const fields = {
      _id:      0,
      _id_user: 0,
      _updated: 0,
      _version: 0
    };

    return Notes.find({_id_user: userId, _updated: {$gt: refresh}}, {fields}).fetch().reduce((diff, note) => {
      note._id = note._id_slug;

      if (note._removed > refresh) {
        diff.removed.push(note._id);
      } else {
        diff.updated.push(note);

        if (note._created > refresh) {
          diff.created.push(note._id);
        }
      }

      delete note._id_slug;
      delete note._created;
      delete note._removed;

      return diff;
    }, {created: [], removed: [], updated: []});
  }
};
