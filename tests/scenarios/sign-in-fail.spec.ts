// @flow

import {toastCheck, userSignUp} from '@tests/actions';

import user from './bits/user';

user
  .last(userSignUp, context => [context.user])
  .last(toastCheck, ['Signing up...'])
  .last(toastCheck, ['User already exists.'])
  .save('Sign in fail');
