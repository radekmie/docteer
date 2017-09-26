// @flow

import {Mongo} from 'meteor/mongo';

import './indexes';
import './restapi';

export {Notes} from '..';

export const NotesArchive = new Mongo.Collection('notes-archive');
