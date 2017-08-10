import {Meteor} from 'meteor/meteor';
import {Mongo}  from 'meteor/mongo';

export const Labels = new Mongo.Collection('labels');

if (Meteor.isServer) {
    Meteor.publish('labels', function labels () {
        return Labels.find();
    });
}
