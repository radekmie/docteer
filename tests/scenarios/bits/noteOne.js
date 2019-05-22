// @flow

import {noteAction} from '@tests/actions';
import {noteCheck} from '@tests/actions';
import {noteSelect} from '@tests/actions';
import {toastCheck} from '@tests/actions';

import noteNew from './noteNew';

// $FlowFixMe: Generics.
export default noteNew
  .next(noteAction, ['save'])
  .next(toastCheck, ['Saving...'])
  .next(toastCheck, ['Saved.'])
  .next(noteCheck, context => [context.note.title])
  .next(noteSelect, context => [context.note.title]);
