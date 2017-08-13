import {Meteor} from 'meteor/meteor';

import {Users} from '..';

Meteor.publish('users.self', function publishUsersSelf () {
    return Users.find({_id: this.userId}, {fields: {emails: 1}});
});
