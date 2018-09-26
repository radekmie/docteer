// @flow

import {toastCheck} from '@tests/actions';
import {userLogOut} from '@tests/actions';
import {userSignUp} from '@tests/actions';

import base from './base';

export default base
  .next(userSignUp, context => [context.user])
  .next(toastCheck, ['Signing up...'])
  .next(toastCheck, ['Signed in.'])
  .next(toastCheck, ['Loading...'])
  .next(toastCheck, ['Loaded.'])
  .last(userLogOut, [])
  .last(toastCheck, ['Logging out...'])
  .last(toastCheck, ['Logged out.']);
