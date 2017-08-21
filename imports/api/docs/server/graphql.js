import {GraphQLError}      from 'graphql/error/GraphQLError';
import {GraphQLList}       from 'graphql/type/definition';
import {GraphQLNonNull}    from 'graphql/type/definition';
import {GraphQLScalarType} from 'graphql/type/definition';
import {GraphQLString}     from 'graphql/type/scalars';
import {OBJECT}            from 'graphql/language/kinds';
import {STRING}            from 'graphql/language/kinds';

import {bulkPatch} from '/imports/lib/server/bulkPatch';

import {Docs} from '..';

export const Doc = new GraphQLScalarType({
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

Docs.mutations = {
    docsPatch: {
        type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(Doc))),

        args: {
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

            return docsByUser(args.userId);
        }
    }
};

Docs.queries = {
    docs: {
        type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(Doc))),

        args: {
            session: {type: new GraphQLNonNull(GraphQLString)},
            userId:  {type: new GraphQLNonNull(GraphQLString)}
        },

        resolve (_, args, context) {
            if (!context.authenticate({session: args.session, userId: args.userId})) {
                return [];
            }

            return docsByUser(args.userId);
        }
    }
};

function docsByUser (userId) {
    const fields = {
        _id:      0,
        _id_user: 0,
        _created: 0,
        _removed: 0,
        _updated: 0,
        _version: 0
    };

    return Docs.find({_removed: null, _id_user: userId}, {fields}).map(doc => {
        doc._id = doc._id_slug;

        delete doc._id_slug;
        return doc;
    });
}
