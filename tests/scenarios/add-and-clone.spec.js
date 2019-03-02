// @flow

import faker from 'faker';

import {noteAction} from '@tests/actions';
import {noteCheck} from '@tests/actions';
import {noteField} from '@tests/actions';
import {noteSelect} from '@tests/actions';
import {toastCheck} from '@tests/actions';

import noteOne from './bits/noteOne';

noteOne
  .next(noteSelect, context => [context.note.title])
  .next(noteAction, ['edit'])
  .next(noteAction, ['clone'])
  .with(() => ({
    note: {
      title: (faker.lorem.words(): string)
    }
  }))
  .next(noteField, context => [0, 'Name', context.note.title])
  .next(noteCheck, context => [context.note.title, 'light-green'])
  .next(noteAction, ['save'])
  .next(noteCheck, context => [context.note.title])
  .next(toastCheck, ['Saving...'])
  .next(toastCheck, ['Saved.'])
  .save('Add and clone note');
