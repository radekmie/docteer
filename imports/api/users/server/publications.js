import {Accounts} from 'meteor/accounts-base';
import {Meteor}   from 'meteor/meteor';

import {Users} from '..';

if (Users.find({}, {fields: {_id: 1}}).count() === 0) {
    Accounts.createUser({email: 'admin@doctear.com', password: 'doctear'});
}

Meteor.publish('users.self', function publishUsersSelf () {
    return Users.find({_id: this.userId}, {fields: {emails: 1}});
});
