import { noteAction, noteCheck, noteSelect, toastCheck } from '../actions';
import noteOne from './bits/noteOne';

noteOne
  .next(noteSelect, context => [context.note.title] as const)
  .next(noteAction, ['edit'])
  .next(noteAction, ['remove'])
  .next(noteCheck, context => [context.note.title, 'light-red'] as const)
  .next(noteAction, ['save'])
  .next(noteCheck, context => [context.note.title, '-'] as const)
  .next(toastCheck, ['Saving...'])
  .next(toastCheck, ['Saved.'])
  .save('Add and remove note');
