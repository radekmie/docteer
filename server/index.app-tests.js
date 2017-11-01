// @flow

import faker from 'faker';

import {before} from 'meteor/universe:e2e';
// $FlowFixMe: No local file.
import {describe} from 'meteor/universe:e2e';

import {action} from './imports/test/action';
import {click} from './imports/test/click';
import {expand} from './imports/test/expand';
import {field} from './imports/test/field';
import {login} from './imports/test/login';
import {logout} from './imports/test/logout';
import {navigate} from './imports/test/navigate';
import {note} from './imports/test/note';
import {resize} from './imports/test/resize';
import {select} from './imports/test/select';
import {signin} from './imports/test/signin';
import {start} from './imports/test/start';
import {toast} from './imports/test/toast';
import {type} from './imports/test/type';
import {wait} from './imports/test/wait';

//

type DAGStep = {
  args: (Object => any[]) | any[],
  fn: Function
};

const DAGStepper = context => ({args, fn}) =>
  fn(...(Array.isArray(args) ? args : args(context)));

class DAG {
  _last: DAGStep[];
  _next: DAGStep[];

  constructor(next: DAGStep[] = [], last: DAGStep[] = []) {
    this._last = last;
    this._next = next;
  }

  as(title) {
    describe(title, () => {
      const context = {};
      const stepper = DAGStepper(context);
      this._next.forEach(stepper);
      this._last.forEach(stepper);
    });
  }

  last(fn, args) {
    return new DAG(this._next, this._last.concat({args, fn}));
  }

  next(fn, args) {
    return new DAG(this._next.concat({args, fn}), this._last);
  }

  with(contextify: Object => Object) {
    return this.next(
      context => Object.assign(context, contextify(context)),
      context => [context]
    );
  }
}

before(() => {
  resize(1024, 768);
});

const base = new DAG()
  .with(() => ({
    user: {
      email: faker.internet.email(),
      password: faker.internet.password()
    }
  }))
  .next(start, ['/'])
  .next(navigate, ['Log In']);

base
  .next(login, context => [context.user])
  .next(toast, ['Logging in...'])
  .next(toast, ["Sounds good, doesn't work."])
  .as('Log in fail');

const user = base
  .next(click, ['[href="/r"]'])
  .next(signin, context => [context.user])
  .next(toast, ['Signing in...'])
  .next(toast, ['Signed in.'])
  .next(toast, ['Logging in...'])
  .next(toast, ['Logged in.'])
  .next(toast, ['Loading...'])
  .next(toast, ['Loaded.'])
  .last(logout, [])
  .last(toast, ['Logging out...'])
  .last(toast, ['Logged out.']);

user.as('Log in success');
user
  .last(click, ['[href="/r"]'])
  .last(signin, context => [context.user])
  .last(toast, ['Signing in...'])
  .last(toast, ['User already exists.'])
  .as('Sign in fail');

const noteNew = user
  .with(() => ({
    labels: [faker.lorem.word(), faker.lorem.word()],
    text: faker.lorem.paragraphs(),
    title: faker.lorem.words()
  }))
  .next(navigate, ['Notes'])
  .next(action, ['Create'])
  .next(note, ['(untitled)', 'light-green'])
  .next(field, context => [0, 'Name', context.title])
  .next(field, context => [1, 'Labels', context.labels])
  .next(field, context => [2, 'Text', context.title])
  .next(note, context => [context.title, 'light-green']);

const noteOne = noteNew
  .next(action, ['Save'])
  .next(toast, ['Saving...'])
  .next(toast, ['Saved.'])
  .next(note, context => [context.title]);

noteOne.as('Add note');
noteOne
  .with(() => ({
    diff: faker.lorem.paragraphs()
  }))
  .next(select, context => [context.title])
  .next(action, ['Edit'])
  .next(field, context => [2, 'Text', context.diff])
  .next(note, context => [context.title, 'light-blue'])
  .next(action, ['Save'])
  .next(toast, ['Saving...'])
  .next(toast, ['Saved.'])
  .next(note, context => [context.title])
  .as('Add and edit note');

noteNew
  .next(action, ['Remove'])
  .next(note, context => [context.title, 'light-gray'])
  .next(action, ['Save'])
  .next(note, context => [context.title, '-'])
  .as('Add and remove note before save');

noteOne
  .next(select, context => [context.title])
  .next(action, ['Edit'])
  .next(action, ['Remove'])
  .next(note, context => [context.title, 'light-red'])
  .next(action, ['Save'])
  .next(note, context => [context.title, '-'])
  .next(toast, ['Saving...'])
  .next(toast, ['Saved.'])
  .as('Add and remove note');

user
  .with(() => ({
    pass: faker.internet.password()
  }))
  .next(navigate, ['Settings'])
  .next(expand, ['Change password'])
  .next(type, context => ['#current', context.pass])
  .next(type, context => ['#new1', context.pass])
  .next(type, context => ['#new2', context.pass])
  .next(click, ['[title="Change password"]'])
  .next(toast, ['Changing password...'])
  .next(toast, ['Incorrect old password.'])
  .as('Change password incorrect');

user
  .with(() => ({
    pass: faker.internet.password()
  }))
  .next(navigate, ['Settings'])
  .next(expand, ['Change password'])
  .next(type, context => ['#current', context.user.password])
  .next(type, context => ['#new1', context.user.password])
  .next(type, context => ['#new2', context.pass])
  .next(click, ['[title="Change password"]'])
  .next(toast, ['Changing password...'])
  .next(toast, ['Passwords mismatch.'])
  .as('Change password mismatch');

user
  .with(() => ({
    pass: faker.internet.password()
  }))
  .next(navigate, ['Settings'])
  .next(expand, ['Change password'])
  .next(type, context => ['#current', context.user.password])
  .next(type, context => ['#new1', context.pass])
  .next(type, context => ['#new2', context.pass])
  .next(click, ['[title="Change password"]'])
  .next(toast, ['Changing password...'])
  .next(toast, ['Changed password.'])
  .next(logout, [])
  .next(toast, ['Logging out...'])
  .next(toast, ['Logged out.'])
  .next(wait, [1500])
  .next(navigate, ['Log In'])
  .next(login, context => [{email: context.user.email, password: context.pass}])
  .next(toast, ['Logging in...'])
  .next(toast, ['Logged in.'])
  .next(toast, ['Loading...'])
  .next(toast, ['Loaded.'])
  .as('Change password');
