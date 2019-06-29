// @flow

import faker from 'faker';

import {toastCheck, userChangePassword} from '@tests/actions';

import user from './bits/user';

user
  .with(context => ({
    user: Object.assign({}, context.user, {
      password: faker.internet.password()
    })
  }))
  .next(userChangePassword, context => [
    {
      current: context.user.password,
      new1: context.user.password,
      new2: context.user.password
    }
  ])
  .next(toastCheck, ['Changing password...'])
  .next(toastCheck, ['Incorrect old password.'])
  .save('Change password incorrect');
