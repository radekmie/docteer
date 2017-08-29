import {Mongo} from 'meteor/mongo';

// FIXME: Migrate name.
export const Notes = new Mongo.Collection('docs');
