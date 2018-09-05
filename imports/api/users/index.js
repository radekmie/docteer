// @flow

import {DDP} from 'meteor/ddp';
import {Meteor} from 'meteor/meteor';
import {Mongo} from 'meteor/mongo';

type UsersType = Meteor$Mongo$Collection<Meteor$User>;

export const Users: UsersType = new Mongo.Collection('users');

Users.currentUser = () => {
  const userId = Users.currentUserId();
  return userId ? Users.findOne({_id: userId}) : null;
};

Users.currentUserId = Meteor.isClient
  ? () => Meteor.connection.userId()
  : () => {
      const invocation =
        DDP._CurrentMethodInvocation.get() ||
        DDP._CurrentPublicationInvocation.get();

      return invocation ? invocation.userId : null;
    };
