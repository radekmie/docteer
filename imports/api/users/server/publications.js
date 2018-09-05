// @flow

import {Meteor} from 'meteor/meteor';

import {Users} from '..';

Meteor.publish('LIVE /users/self', function publishUsersSelf() {
  if (!this.userId) return this.ready();

  return Users.find({_id: this.userId}, {fields: {emails: 1, schemas: 1}});
});
