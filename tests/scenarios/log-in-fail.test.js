// @flow

import {toastCheck} from '@tests/actions';
import {userLogIn} from '@tests/actions';

import base from './bits/base';

base
  .next(userLogIn, context => [context.user])
  .next(toastCheck, ['Logging in...'])
  .next(toastCheck, ["Sounds good, doesn't work."])
  .save('Log in fail');
