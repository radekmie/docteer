import {Meteor} from 'meteor/meteor';

import {PlainCollection} from '/imports/lib';

export const Labels = new PlainCollection('labels');

Meteor.publish('labels', function labels () {
    return Labels.find();
});
