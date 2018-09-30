// @flow

import {noteAction} from '@tests/actions';
import {noteCheck} from '@tests/actions';

import noteNew from './bits/noteNew';

noteNew
  .next(noteAction, ['remove'])
  .next(noteCheck, context => [context.note.title, 'light-gray'])
  .next(noteAction, ['save'])
  .next(noteCheck, context => [context.note.title, '-'])
  .save('Add and remove note before save');
