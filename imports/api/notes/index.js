// @flow

import {Mongo} from 'meteor/mongo';

import type {NoteDocType} from '../../types.flow';

type NotesType = Meteor$Mongo$Collection<NoteDocType<{||}>>;

export const Notes: NotesType = new Mongo.Collection('notes');
