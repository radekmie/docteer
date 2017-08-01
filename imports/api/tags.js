import {Meteor} from 'meteor/meteor';

import {PlainCollection} from '/imports/lib';

export const Tags = new PlainCollection('tags');

Meteor.publish('tags', function tags () {
    return Tags.find();
});
