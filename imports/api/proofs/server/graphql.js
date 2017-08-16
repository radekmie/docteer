import {GraphQLID}              from 'graphql/type/scalars';
import {GraphQLInputObjectType} from 'graphql/type/definition';
import {GraphQLList}            from 'graphql/type/definition';
import {GraphQLNonNull}         from 'graphql/type/definition';
import {GraphQLObjectType}      from 'graphql/type/definition';
import {GraphQLString}          from 'graphql/type/scalars';

import {bulkPatch} from '/imports/lib/server/bulkPatch';

import {Proofs} from '..';

export const Proof = new GraphQLObjectType({
    name: 'Proof',
    fields: {
        _id:    {type: new GraphQLNonNull(GraphQLID)},
        expect: {type: new GraphQLNonNull(GraphQLString)},
        labels: {type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLString)))},
        name:   {type: new GraphQLNonNull(GraphQLString)},
        steps:  {type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLString)))},
        target: {type: new GraphQLNonNull(GraphQLString)}
    }
});

export const ProofPatch = new GraphQLInputObjectType({
    name: 'ProofPatch',
    fields: {
        _id:    {type: new GraphQLNonNull(GraphQLID)},
        expect: {type: GraphQLString},
        labels: {type: new GraphQLList(new GraphQLNonNull(GraphQLString))},
        name:   {type: GraphQLString},
        steps:  {type: new GraphQLList(new GraphQLNonNull(GraphQLString))},
        target: {type: GraphQLString}
    }
});

Proofs.mutations = {
    proofsPatch: {
        type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(Proof))),

        args: {
            session: {type: new GraphQLNonNull(GraphQLString)},
            userId:  {type: new GraphQLNonNull(GraphQLString)},

            created: {type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLString)))},
            removed: {type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLString)))},
            updated: {type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(ProofPatch)))}
        },

        resolve (_, args, context) {
            if (context.authenticate({session: args.session, userId: args.userId})) {
                return [];
            }

            bulkPatch(Proofs, args, args.userId).await();

            return proofsByUser(args.userId);
        }
    }
};

Proofs.queries = {
    proofs: {
        type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(Proof))),

        args: {
            session: {type: new GraphQLNonNull(GraphQLString)},
            userId:  {type: new GraphQLNonNull(GraphQLString)}
        },

        resolve (_, args, context) {
            if (context.authenticate({session: args.session, userId: args.userId})) {
                return [];
            }

            return proofsByUser(args.userId);
        }
    }
};

function proofsByUser (userId) {
    const fields = {
        _id_slug: 1,
        expect:   1,
        labels:   1,
        name:     1,
        steps:    1,
        target:   1
    };

    return Proofs.find({_removed: null, _user_id: userId}, {fields}).map(proof => {
        proof._id = proof._id_slug;

        delete proof._id_slug;
        return proof;
    });
}
