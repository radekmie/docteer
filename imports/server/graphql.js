import compression         from 'compression';
import graphqlHTTP         from 'express-graphql';
import {GraphQLObjectType} from 'graphql/type/definition';
import {GraphQLSchema}     from 'graphql/type/schema';

import {Accounts} from 'meteor/accounts-base';
import {Meteor}   from 'meteor/meteor';
import {WebApp}   from 'meteor/webapp';

import {Docs} from '/imports/api/docs/server';

const Mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        ...Docs.mutations
    }
});

const Query = new GraphQLObjectType({
    name: 'Query',
    fields: {
        ...Docs.queries
    }
});

const schema = new GraphQLSchema({mutation: Mutation, query: Query});

const context = {
    authenticate ({session, userId}) {
        return !!Meteor.users.find(
            {_id: userId, 'services.resume.loginTokens.hashedToken': Accounts._hashLoginToken(session)},
            {fields: {_id: 1}}
        ).count();
    }
};

WebApp.rawConnectHandlers.use('/graphql', compression({threshold: false}));
WebApp.rawConnectHandlers.use('/graphql', graphqlHTTP({context, graphiql: process.env.NODE_ENV !== 'production', schema}));
