import faker from 'faker';

import {
  toastCheck,
  userChangePassword,
  userLogIn,
  userLogOut,
} from '../actions';
import user from './bits/user';

user
  .with(() => ({ password: faker.internet.password() }))
  .next(
    userChangePassword,
    context =>
      [
        {
          current: context.user.password,
          new1: context.password,
          new2: context.password,
        },
      ] as const,
  )
  .with(context => ({
    user: Object.assign({}, context.user, {
      password: context.password,
    }),
  }))
  .next(toastCheck, ['Changing password...'])
  .next(toastCheck, ['Changed password.'])
  .next(userLogOut, [])
  .next(toastCheck, ['Logging out...'])
  .next(toastCheck, ['Logged out.'])
  .next(userLogIn, context => [context.user] as const)
  .next(toastCheck, ['Logging in...'])
  .next(toastCheck, ['Logged in.'])
  .next(toastCheck, ['Loading...'])
  .next(toastCheck, ['Loaded.'])
  .save('Change password');
