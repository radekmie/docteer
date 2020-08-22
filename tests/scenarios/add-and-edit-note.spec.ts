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
  .with(context => ({
    note: Object.assign({}, context.note, {
      text: faker.lorem.paragraphs(),
    }),
  }))
  .next(noteSelect, context => [context.note.title] as const)
  .next(noteAction, ['edit'])
  .next(noteField, context => [2, 'Text', context.note.text] as const)
  .next(noteCheck, context => [context.note.title, 'light-blue'] as const)
  .next(noteAction, ['save'])
  .next(toastCheck, ['Saving...'])
  .next(toastCheck, ['Saved.'])
  .next(noteCheck, context => [context.note.title] as const)
  .save('Add and edit note');
