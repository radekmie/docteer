import compression              from 'compression';
import graphqlHTTP              from 'express-graphql';
import {GraphQLID}              from 'graphql/type/scalars';
import {GraphQLInputObjectType} from 'graphql/type/definition';
import {GraphQLList}            from 'graphql/type/definition';
import {GraphQLNonNull}         from 'graphql/type/definition';
import {GraphQLObjectType}      from 'graphql/type/definition';
import {GraphQLSchema}          from 'graphql/type/schema';
import {GraphQLString}          from 'graphql/type/scalars';

import {Meteor} from 'meteor/meteor';
import {WebApp} from 'meteor/webapp';

import {Proofs}    from '/imports/api/proofs';
import {bulkPatch} from '/imports/lib/server/bulkPatch';

const Proof = new GraphQLObjectType({
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

const ProofPatch = new GraphQLInputObjectType({
    name: 'ProofPatch',
    fields: {
        _id:    {type: GraphQLID},
        expect: {type: GraphQLString},
        labels: {type: new GraphQLList(new GraphQLNonNull(GraphQLString))},
        name:   {type: GraphQLString},
        steps:  {type: new GraphQLList(new GraphQLNonNull(GraphQLString))},
        target: {type: GraphQLString}
    }
});

const Mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        proofsPatch: {
            type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(Proof))),

            args: {
                session: {type: new GraphQLNonNull(GraphQLString)},
                userId:  {type: new GraphQLNonNull(GraphQLString)},

                created: {type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLString)))},
                removed: {type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLString)))},
                updated: {type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(ProofPatch)))}
            },

            resolve (_, {session, userId, ...patch}) {
                // Inactive session.
                if (Meteor.server.sessions[session] === undefined)
                    return [];

                // Invalid session OR stolen session.
                if (Meteor.server.sessions[session].userId !== userId)
                    return [];

                // Mutate.
                bulkPatch(Proofs, patch, userId).await();

                // Mapped data.
                return Proofs.find({userId}, {fields: {_id: 0, userId: 0}}).map(proof => {
                    proof._id = proof._ud;

                    delete proof._ud;
                    return proof;
                });
            }
        }
    }
});

const Query = new GraphQLObjectType({
    name: 'Query',
    fields: {
        proofs: {
            type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(Proof))),

            args: {
                session: {type: new GraphQLNonNull(GraphQLString)},
                userId:  {type: new GraphQLNonNull(GraphQLString)}
            },

            resolve (_, {session, userId}) {
                // Inactive session.
                if (Meteor.server.sessions[session] === undefined)
                    return [];

                // Invalid session OR stolen session.
                if (Meteor.server.sessions[session].userId !== userId)
                    return [];

                // Mapped data.
                return Proofs.find({userId}, {fields: {_id: 0, userId: 0}}).map(proof => {
                    proof._id = proof._ud;

                    delete proof._ud;
                    return proof;
                });
            }
        }
    }
});

const schema = new GraphQLSchema({mutation: Mutation, query: Query});

WebApp.rawConnectHandlers.use('/graphql', compression({threshold: false}));
WebApp.rawConnectHandlers.use('/graphql', graphqlHTTP({graphiql: process.env.NODE_ENV !== 'production', schema}));
