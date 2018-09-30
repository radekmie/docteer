// @flow

import {noteAction} from '@tests/actions';
import {toastCheck} from '@tests/actions';

import noteOne from './bits/noteOne';

noteOne
  .next(noteAction, ['refresh'])
  .next(toastCheck, ['Refreshing...'])
  .next(toastCheck, ['Refreshed.'])
  .save('Refresh notes');
