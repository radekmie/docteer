import { noteAction, noteCheck, noteSelect, toastCheck } from '../../actions';
import noteNew from './noteNew';

export default noteNew
  .next(noteAction, ['save'])
  .next(toastCheck, ['Saving...'])
  .next(toastCheck, ['Saved.'])
  .next(noteCheck, context => [context.note.title] as const)
  .next(noteSelect, context => [context.note.title] as const);
