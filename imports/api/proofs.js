import {Meteor} from 'meteor/meteor';
import {Mongo}  from 'meteor/mongo';

export const Proofs = new Mongo.Collection('proofs');

Proofs.allow({
    update: () => true
});

if (Meteor.isServer) {
    Meteor.publish('proofs', function proofs () {
        return Proofs.find();
    });
}
