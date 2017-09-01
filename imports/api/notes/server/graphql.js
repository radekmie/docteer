// @flow

import {GraphQLError}      from 'graphql/error/GraphQLError';
import {GraphQLList}       from 'graphql/type/definition';
import {GraphQLNonNull}    from 'graphql/type/definition';
import {GraphQLObjectType} from 'graphql/type/definition';
import {GraphQLScalarType} from 'graphql/type/definition';
import {GraphQLString}     from 'graphql/type/scalars';
import {LIST}              from 'graphql/language/kinds';
import {OBJECT}            from 'graphql/language/kinds';
import {STRING}            from 'graphql/language/kinds';

import {Promise} from 'meteor/promise';

import {Notes} from '..';

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

const GraphQLDate = new GraphQLScalarType({
  name: 'Date',

  parseLiteral (ast) {
    if (ast.kind !== STRING)
      throw new GraphQLError(`Query error: Can only parse strings to dates but got: ${ast.kind}`, [ast]);

    const result = new Date(ast.value);

    if (!result)
      throw new GraphQLError('Query error: Invalid date', [ast]);

    if (ast.value !== result.toJSON())
      throw new GraphQLError('Query error: Invalid date format, only accepts: YYYY-MM-DDTHH:MM:SS.SSSZ', [ast]);

    return result;
  },

  parseValue (value) {
    if (typeof value !== 'number' && typeof value !== 'string' && !(value instanceof Date))
      throw new TypeError('Field error: value is an invalid Date');

    const result = new Date(value);

    if (!result)
      throw new TypeError('Field error: value is an invalid Date');

    return result;
  },

  serialize (value) {
    if (!(value instanceof Date))
      throw new TypeError('Field error: value is not an instance of Date');

    if (!value)
      throw new TypeError('Field error: value is an invalid Date');

    return value.toJSON();
  }
});

const Note = new GraphQLScalarType({
  name: 'Note',

  parseLiteral (ast) {
    if (ast.kind !== OBJECT)
      throw new GraphQLError(`Query error: Note must be an object but got: ${ast.kind}`, [ast]);

    const _id = ast.fields.find(field => field.name.value === '_id');

    if (!_id)
      throw new GraphQLError('Query error: Note _id must be present', [ast]);

    if (_id.kind !== STRING)
      throw new GraphQLError(`Query error: Note _id must be a string but got: ${_id.kind}`, [ast]);

    ast.fields.forEach(field => {
      const key = field.name.value;

      if (key.substr(0, 1) === '_' && (key !== '_id' || key !== '_outline') || key.indexOf('.') !== -1 || key !== key.toLowerCase())
        throw new GraphQLError(`Query error: Note cannot have a field named: ${key}`, [ast]);
    });

    return ast.fields.reduce((value, field) => {
      if (field.value.kind === STRING)
        return field.value.value;

      if (field.value.kind !== LIST)
        throw new GraphQLError(`Query error: Note cannot have a field: ${field.value.kind}`, [ast]);

      return Object.assign(value, {[field.name.value]: field.value.values.map(value => {
        if (value.kind !== STRING)
          throw new GraphQLError(`Query error: Note cannot have a field: ${value.kind}`, [ast]);

        return value.value;
      })});
    }, Object.create(null));
  },

  parseValue (value) {
    return value;
  },

  serialize (value) {
    return value;
  }
});

const NotesDiff = new GraphQLNonNull(new GraphQLObjectType({
  name: 'NotesDiff',

  fields: {
    created: {type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLString)))},
    removed: {type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLString)))},
    updated: {type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(Note)))}
  }
}));

Notes.mutations = {
  notesPatch: {
    type: NotesDiff,

    args: {
      refresh: {type: GraphQLDate},
      session: {type: new GraphQLNonNull(GraphQLString)},
      userId:  {type: new GraphQLNonNull(GraphQLString)},

      created: {type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLString)))},
      removed: {type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLString)))},
      updated: {type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(Note)))}
    },

    resolve (_, args, context) {
      if (!context.authenticate({session: args.session, userId: args.userId}))
        return {created: [], removed: [], updated: []};

      bulkPatch(Notes, args, args.userId).await();

      return notesByUser(args.userId, args.refresh);
    }
  }
};

Notes.queries = {
  notes: {
    type: NotesDiff,

    args: {
      refresh: {type: GraphQLDate},
      session: {type: new GraphQLNonNull(GraphQLString)},
      userId:  {type: new GraphQLNonNull(GraphQLString)}
    },

    resolve (_, args, context) {
      if (!context.authenticate({session: args.session, userId: args.userId})) {
        return {created: [], removed: [], updated: []};
      }

      return notesByUser(args.userId, args.refresh);
    }
  }
};

function notesByUser (userId, after) {
  const refresh = after || new Date(0);
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
