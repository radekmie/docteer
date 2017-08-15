import {Accounts} from 'meteor/accounts-base';
import {Meteor}   from 'meteor/meteor';

if (Meteor.users.find({}, {fields: {_id: 1}}).count() === 0) {
    Accounts.createUser({email: 'admin@doctear.com', password: 'doctear'});
}

Meteor.publish('users.self', function publishUsersSelf () {
    return Meteor.users.find({_id: this.userId}, {fields: {emails: 1}});
});
