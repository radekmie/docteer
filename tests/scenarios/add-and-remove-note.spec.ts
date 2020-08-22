// @flow

import {noteAction, noteCheck, noteSelect, toastCheck} from '@tests/actions';

import noteOne from './bits/noteOne';

noteOne
  .next(noteSelect, context => [context.note.title])
  .next(noteAction, ['edit'])
  .next(noteAction, ['remove'])
  .next(noteCheck, context => [context.note.title, 'light-red'])
  .next(noteAction, ['save'])
  .next(noteCheck, context => [context.note.title, '-'])
  .next(toastCheck, ['Saving...'])
  .next(toastCheck, ['Saved.'])
  .save('Add and remove note');
