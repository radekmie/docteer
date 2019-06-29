// @flow

import {noteAction, noteCheck, noteField} from '@tests/actions';

import noteOne from './bits/noteOne';

noteOne
  .next(noteAction, ['create'])
  .next(noteCheck, ['(untitled)', 'light-green'])
  .next(noteField, context => [
    1,
    'Labels',
    context.note.labels,
    {useAutocomplete: true}
  ])
  .save('Add autocompleted labels');
