import { noteAction, noteCheck } from '../actions';
import noteNew from './bits/noteNew';

noteNew
  .next(noteAction, ['remove'])
  .next(noteCheck, context => [context.note.title, 'light-gray'] as const)
  .next(noteAction, ['save'])
  .next(noteCheck, context => [context.note.title, '-'] as const)
  .save('Add and remove note before save');
