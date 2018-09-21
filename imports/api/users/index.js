// @flow

import {Mongo} from 'meteor/mongo';

type UsersType = Meteor$Mongo$Collection<Meteor$User>;

export const Users: UsersType = new Mongo.Collection('users');
