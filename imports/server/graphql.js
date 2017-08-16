import compression         from 'compression';
import graphqlHTTP         from 'express-graphql';
import {GraphQLObjectType} from 'graphql/type/definition';
import {GraphQLSchema}     from 'graphql/type/schema';

import {Accounts} from 'meteor/accounts-base';
import {Meteor}   from 'meteor/meteor';
import {WebApp}   from 'meteor/webapp';

import {Proofs} from '/imports/api/proofs/server';

const Mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        ...Proofs.mutations
    }
});

const Query = new GraphQLObjectType({
    name: 'Query',
    fields: {
        ...Proofs.queries
    }
});

const schema = new GraphQLSchema({mutation: Mutation, query: Query});

const context = {
    authenticate ({session, userId}) {
        // Allow everything in development.
        if (process.env.NODE_ENV !== 'production') {
            return !!userId;
        }

        const token = Accounts._hashLoginToken(session);

        return !!Meteor.users.find({_id: userId, 'services.resume.hashedToken': token}, {fields: {_id: 1}}).count();
    }
};

WebApp.rawConnectHandlers.use('/graphql', compression({threshold: false}));
WebApp.rawConnectHandlers.use('/graphql', graphqlHTTP({context, graphiql: process.env.NODE_ENV !== 'production', schema}));
