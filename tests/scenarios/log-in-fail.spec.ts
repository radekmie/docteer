import { toastCheck, userLogIn } from '../actions';
import base from './bits/base';

base
  .next(userLogIn, context => [context.user] as const)
  .next(toastCheck, ['Logging in...'])
  .next(toastCheck, ["Sounds good, doesn't work."])
  .save('Log in fail');
