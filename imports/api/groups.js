import {Meteor} from 'meteor/meteor';

import {PlainCollection} from '/imports/lib';

export const Groups = new PlainCollection('groups');

Meteor.publish('groups', function groups () {
    return Groups.find();
});
