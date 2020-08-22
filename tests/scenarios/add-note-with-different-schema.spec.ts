import faker from 'faker';

import {
  navigate,
  noteAction,
  noteCheck,
  noteField,
  noteSchema,
  noteSelect,
  toastCheck,
  userAddSchema,
} from '../actions';
import noteNew from './bits/noteNew';

noteNew
  .with(() => ({
    schema: {
      name: faker.lorem.word(),
      fields: [
        { name: 'textA', type: 'div' as const },
        { name: 'textB', type: 'textarea' as const },
      ],
    },
  }))
  .next(userAddSchema, context => [context.schema] as const)
  .next(navigate, ['notes'])
  .next(noteSelect, context => [context.note.title] as const)
  .next(noteSchema, context => [context.schema.name] as const)
  .next(noteField, context => [2, 'Text A', context.note.title] as const)
  .next(noteField, context => [3, 'Text B', context.note.title] as const)
  .next(noteAction, ['save'])
  .next(toastCheck, ['Saving...'])
  .next(toastCheck, ['Saved.'])
  .next(noteCheck, context => [context.note.title] as const)
  .next(noteSelect, context => [context.note.title] as const)
  .save('Add note with different schema');
