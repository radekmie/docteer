import { toastCheck, userSignUp } from '../actions';
import user from './bits/user';

user
  .last(userSignUp, context => [context.user] as const)
  .last(toastCheck, ['Signing up...'])
  .last(toastCheck, ['User already exists.'])
  .save('Sign in fail');
