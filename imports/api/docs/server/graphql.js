import {GraphQLError}      from 'graphql/error/GraphQLError';
import {GraphQLList}       from 'graphql/type/definition';
import {GraphQLNonNull}    from 'graphql/type/definition';
import {GraphQLObjectType} from 'graphql/type/definition';
import {GraphQLScalarType} from 'graphql/type/definition';
import {GraphQLString}     from 'graphql/type/scalars';
import {OBJECT}            from 'graphql/language/kinds';
import {STRING}            from 'graphql/language/kinds';

import {bulkPatch} from '/imports/lib/server/bulkPatch';

import {Docs} from '..';

const GraphQLDate = new GraphQLScalarType({
    name: 'Date',

    parseLiteral (ast) {
        if (ast.kind !== STRING) {
            throw new GraphQLError(`Query error: Can only parse strings to dates but got: ${ast.kind}`, [ast]);
        }

        const result = new Date(ast.value);

        if (!result) {
            throw new GraphQLError('Query error: Invalid date', [ast]);
        }

        if (ast.value !== result.toJSON()) {
            throw new GraphQLError('Query error: Invalid date format, only accepts: YYYY-MM-DDTHH:MM:SS.SSSZ', [ast]);
        }

        return result;
    },

    parseValue (value) {
        const result = new Date(value);

        if (!result) {
            throw new TypeError('Field error: value is an invalid Date');
        }

        return result;
    },

    serialize (value) {
        if (!(value instanceof Date)) {
            throw new TypeError('Field error: value is not an instance of Date');
        }

        if (!value) {
            throw new TypeError('Field error: value is an invalid Date');
        }

        return value.toJSON();
    }
});

const Doc = new GraphQLScalarType({
    name: 'Doc',

    parseLiteral (ast) {
        if (ast.kind !== OBJECT) {
            throw new GraphQLError(`Query error: Doc must be an object but got: ${ast.kind}`, [ast]);
        }

        if (ast.value._id === undefined) {
            throw new GraphQLError('Query error: Doc _id must be present', [ast]);
        }

        if (ast.value._id.kind !== STRING) {
            throw new GraphQLError(`Query error: Doc _id must be a string but got: ${ast.value._id.kind}`, [ast]);
        }

        for (const key of Object.keys(ast.value)) {
            if (key.substr(0, 1) === '_' && (key !== '_id' || key !== '_outline') || key.indexOf('.') !== -1 || key !== key.toLowerCase()) {
                throw new GraphQLError(`Query error: Doc cannot have a field named: ${key}`, [ast]);
            }
        }

        return ast.value;
    },

    parseValue (value) {
        return value;
    },

    serialize (value) {
        return value;
    }
});

const DocsDiff = new GraphQLNonNull(new GraphQLObjectType({
    name: 'DocsDiff',

    fields: {
        created: {type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLString)))},
        removed: {type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLString)))},
        updated: {type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(Doc)))}
    }
}));

Docs.mutations = {
    docsPatch: {
        type: DocsDiff,

        args: {
            refresh: {type: GraphQLDate},
            session: {type: new GraphQLNonNull(GraphQLString)},
            userId:  {type: new GraphQLNonNull(GraphQLString)},

            created: {type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLString)))},
            removed: {type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLString)))},
            updated: {type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(Doc)))}
        },

        resolve (_, args, context) {
            if (!context.authenticate({session: args.session, userId: args.userId})) {
                return [];
            }

            bulkPatch(Docs, args, args.userId).await();

            return docsByUser(args.userId, args.refresh);
        }
    }
};

Docs.queries = {
    docs: {
        type: DocsDiff,

        args: {
            refresh: {type: GraphQLDate},
            session: {type: new GraphQLNonNull(GraphQLString)},
            userId:  {type: new GraphQLNonNull(GraphQLString)}
        },

        resolve (_, args, context) {
            if (!context.authenticate({session: args.session, userId: args.userId})) {
                return [];
            }

            return docsByUser(args.userId, args.refresh);
        }
    }
};

function docsByUser (userId, after) {
    const refresh = after || new Date(0);
    const fields = {
        _id:      0,
        _id_user: 0,
        _updated: 0,
        _version: 0
    };

    return Docs.find({_id_user: userId, _updated: {$gt: refresh}}, {fields}).fetch().reduce((diff, doc) => {
        doc._id = doc._id_slug;

        if (doc._removed > refresh) {
            diff.removed.push(doc._id);
        } else {
            diff.updated.push(doc);

            if (doc._created > refresh) {
                diff.created.push(doc._id);
            }
        }

        delete doc._id_slug;
        delete doc._created;
        delete doc._removed;

        return diff;
    }, {created: [], removed: [], updated: []});
}
