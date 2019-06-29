// @flow

import faker from 'faker';

import {toastCheck, userChangePassword} from '@tests/actions';

import user from './bits/user';

user
  .with(() => ({password: faker.internet.password()}))
  .next(userChangePassword, context => [
    {
      current: context.user.password,
      new1: context.user.password,
      new2: context.password
    }
  ])
  .next(toastCheck, ['Changing password...'])
  .next(toastCheck, ['Passwords mismatch.'])
  .save('Change password mismatch');
