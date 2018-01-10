// @flow

import {Meteor} from 'meteor/meteor';

Meteor.publish('LIVE /users/self', function publishUsersSelf() {
  if (!this.userId) return this.ready();

  return Meteor.users.find(
    {_id: this.userId},
    {fields: {emails: 1, schemas: 1}}
  );
});
