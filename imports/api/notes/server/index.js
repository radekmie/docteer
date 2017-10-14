// @flow

import {Mongo} from 'meteor/mongo';

import './indexes';
import './methods';

export {Notes} from '..';

export const NotesArchive = new Mongo.Collection('notes-archive');
