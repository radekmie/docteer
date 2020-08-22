// @flow

import {noteCheck, toastCheck, userLogOut, userSignUp} from '@tests/actions';

import base from './base';

// $FlowFixMe: Generics.
export default base
  .next(userSignUp, context => [context.user])
  .next(toastCheck, ['Signing up...'])
  .next(toastCheck, ['Signed in.'])
  .next(toastCheck, ['Loading...'])
  .next(toastCheck, ['Loaded.'])
  .next(noteCheck, ['Introduction to DocTeer'])
  .last(userLogOut, [])
  .last(toastCheck, ['Logging out...'])
  .last(toastCheck, ['Logged out.']);
