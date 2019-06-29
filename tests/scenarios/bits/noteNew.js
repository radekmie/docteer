// @flow

import faker from 'faker';

import {navigate, noteAction, noteCheck, noteField} from '@tests/actions';

import user from './user';

// $FlowFixMe: Generics.
export default user
  .with(() => ({
    note: {
      labels: [
        'a' + (faker.lorem.word(): string),
        'b' + (faker.lorem.word(): string),
        'c' + (faker.lorem.word(): string)
      ],
      text: (faker.lorem.paragraphs(): string),
      title: (faker.lorem.words(): string)
    }
  }))
  .next(navigate, ['notes'])
  .next(noteAction, ['create'])
  .next(noteCheck, ['(untitled)', 'light-green'])
  .next(noteField, context => [0, 'Name', context.note.title])
  .next(noteField, context => [1, 'Labels', context.note.labels])
  .next(noteField, context => [2, 'Text', context.note.title])
  .next(noteCheck, context => [context.note.title, 'light-green']);
