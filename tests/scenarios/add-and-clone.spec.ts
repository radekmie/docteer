import faker from 'faker';

import {
  noteAction,
  noteCheck,
  noteField,
  noteSelect,
  toastCheck,
} from '../actions';
import noteOne from './bits/noteOne';

noteOne
  .next(noteSelect, context => [context.note.title] as const)
  .next(noteAction, ['edit'])
  .next(noteAction, ['clone'])
  .with(() => ({
    note: {
      title: faker.lorem.words(),
    },
  }))
  .next(noteField, context => [0, 'Name', context.note.title] as const)
  .next(noteCheck, context => [context.note.title, 'light-green'] as const)
  .next(noteAction, ['save'])
  .next(noteCheck, context => [context.note.title] as const)
  .next(toastCheck, ['Saving...'])
  .next(toastCheck, ['Saved.'])
  .save('Add and clone note');
