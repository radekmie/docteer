// @flow

import faker from 'faker';

import {
  navigate,
  noteAction,
  noteCheck,
  noteField,
  noteSchema,
  noteSelect,
  toastCheck,
  userAddSchema
} from '@tests/actions';

import noteNew from './bits/noteNew';

noteNew
  .with(() => ({
    schema: {
      name: (faker.lorem.word(): string),
      fields: [{name: 'textA', type: 'div'}, {name: 'textB', type: 'textarea'}]
    }
  }))
  .next(userAddSchema, context => [context.schema])
  .next(navigate, ['notes'])
  .next(noteSelect, context => [context.note.title])
  .next(noteSchema, context => [context.schema.name])
  .next(noteField, context => [2, 'Text A', context.note.title])
  .next(noteField, context => [3, 'Text B', context.note.title])
  .next(noteAction, ['save'])
  .next(toastCheck, ['Saving...'])
  .next(toastCheck, ['Saved.'])
  .next(noteCheck, context => [context.note.title])
  .next(noteSelect, context => [context.note.title])
  .save('Add note with different schema');
