import faker from 'faker';

import { navigate, noteAction, noteCheck, noteField } from '../../actions';
import user from './user';

export default user
  .with(() => ({
    note: {
      labels: [
        'a' + faker.lorem.word(),
        'b' + faker.lorem.word(),
        'c' + faker.lorem.word(),
      ],
      text: faker.lorem.paragraphs(),
      title: faker.lorem.words(),
    },
  }))
  .next(navigate, ['notes'])
  .next(noteAction, ['create'])
  .next(noteCheck, ['(untitled)', 'light-green'])
  .next(noteField, context => [0, 'Name', context.note.title] as const)
  .next(noteField, context => [1, 'Labels', context.note.labels] as const)
  .next(noteField, context => [2, 'Text', context.note.title] as const)
  .next(noteCheck, context => [context.note.title, 'light-green'] as const);
