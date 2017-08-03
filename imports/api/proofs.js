import {Meteor} from 'meteor/meteor';

import {PlainCollection} from '/imports/lib';

export const Proofs = new PlainCollection('proofs');

Meteor.publish('proofs', function proofs () {
    return Proofs.find();
});
