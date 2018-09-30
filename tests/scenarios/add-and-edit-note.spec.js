// @flow

import faker from 'faker';

import {noteAction} from '@tests/actions';
import {noteCheck} from '@tests/actions';
import {noteField} from '@tests/actions';
import {noteSelect} from '@tests/actions';
import {toastCheck} from '@tests/actions';

import noteOne from './bits/noteOne';

noteOne
  .with(context => ({
    note: Object.assign({}, context.note, {
      text: faker.lorem.paragraphs()
    })
  }))
  .next(noteSelect, context => [context.note.title])
  .next(noteAction, ['edit'])
  .next(noteField, context => [2, 'Text', context.note.text])
  .next(noteCheck, context => [context.note.title, 'light-blue'])
  .next(noteAction, ['save'])
  .next(toastCheck, ['Saving...'])
  .next(toastCheck, ['Saved.'])
  .next(noteCheck, context => [context.note.title])
  .save('Add and edit note');
