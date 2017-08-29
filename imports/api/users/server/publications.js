import {Meteor} from 'meteor/meteor';

Meteor.publish('users.self', function publishUsersSelf () {
  return Meteor.users.find({_id: this.userId}, {fields: {emails: 1, schemas: 1}});
});
