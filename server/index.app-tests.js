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

type DAGStep<Context, Args = any> = {
  args: (Context => Args) | Args,
  fn: (...Args) => ?Context
};

class DAG<Context> {
  _last: DAGStep<Context>[];
  _next: DAGStep<Context>[];

  constructor(next: DAGStep<Context>[] = [], last: DAGStep<Context>[] = []) {
    this._last = last;
    this._next = next;
  }

  static create(): DAG<{}> {
    return new DAG();
  }

  as(title: string): void {
    describe(title, this.bind());
  }

  bind(): () => void {
    return (): void => {
      const step = (context: $Shape<Context>, {args, fn}): $Shape<Context> =>
        fn(...(Array.isArray(args) ? args : args(context))) || context;

      this._last.reduce(step, this._next.reduce(step, {}));
    };
  }

  last<Args>(
    fn: (...Args) => ?Context,
    args: (Context => Args) | Args
  ): DAG<Context> {
    // $FlowFixMe
    return new DAG(this._next, this._last.concat({args, fn}));
  }

  only(title) {
    describe.only(title, this.bind());
  }

  next<Args>(
    fn: (...Args) => ?Context,
    args: (Context => Args) | Args
  ): DAG<Context> {
    // $FlowFixMe
    return new DAG(this._next.concat({args, fn}), this._last);
  }

  with<ContextNext>(map: Context => ContextNext): DAG<Context & ContextNext> {
    // $FlowFixMe
    const id = ($: DAGStep<Context>[]) => ($: DAGStep<Context & ContextNext>[]);

    return new DAG(
      id(this._next).concat({
        args: context => [context],
        fn: context => Object.assign({}, context, map(context))
      }),
      id(this._last)
    );
  }
}

before(() => {
  resize(1024, 768);
});

const base = DAG.create()
  .with(() => ({
    user: {
      email: (faker.internet.email(): string),
      password: (faker.internet.password(): string)
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
  .next(navigate, ['Settings'])
  .next(expand, ['Change password'])
  .next(type, context => ['#current', context.user.password])
  .with(context => ({
    user: Object.assign({}, context.user, {
      password: faker.internet.password()
    })
  }))
  .next(type, context => ['#new1', context.user.password])
  .next(type, context => ['#new2', context.user.password])
  .next(click, ['[title="Change password"]'])
  .next(toast, ['Changing password...'])
  .next(toast, ['Changed password.'])
  .next(logout, [])
  .next(toast, ['Logging out...'])
  .next(toast, ['Logged out.'])
  .next(wait, [1500])
  .next(navigate, ['Log In'])
  .next(login, context => [context.user])
  .next(toast, ['Logging in...'])
  .next(toast, ['Logged in.'])
  .next(toast, ['Loading...'])
  .next(toast, ['Loaded.'])
  .as('Change password');

user
  .last(click, ['[href="/r"]'])
  .last(signin, context => [context.user])
  .last(toast, ['Signing in...'])
  .last(toast, ['User already exists.'])
  .as('Sign in fail');

user
  .with(context => ({
    user: Object.assign({}, context.user, {
      password: faker.internet.password()
    })
  }))
  .next(navigate, ['Settings'])
  .next(expand, ['Change password'])
  .next(type, context => ['#current', context.user.password])
  .next(type, context => ['#new1', context.user.password])
  .next(type, context => ['#new2', context.user.password])
  .next(click, ['[title="Change password"]'])
  .next(toast, ['Changing password...'])
  .next(toast, ['Incorrect old password.'])
  .as('Change password incorrect');

user
  .next(navigate, ['Settings'])
  .next(expand, ['Change password'])
  .next(type, context => ['#current', context.user.password])
  .next(type, context => ['#new1', context.user.password])
  .with(context => ({
    user: Object.assign({}, context.user, {
      password: faker.internet.password()
    })
  }))
  .next(type, context => ['#new2', context.user.password])
  .next(click, ['[title="Change password"]'])
  .next(toast, ['Changing password...'])
  .next(toast, ['Passwords mismatch.'])
  .as('Change password mismatch');

const noteNew = user
  .with(() => ({
    note: {
      labels: [
        (faker.lorem.word(): string),
        (faker.lorem.word(): string),
        (faker.lorem.word(): string)
      ],
      text: (faker.lorem.paragraphs(): string),
      title: (faker.lorem.words(): string)
    }
  }))
  .next(navigate, ['Notes'])
  .next(action, ['Create'])
  .next(note, ['(untitled)', 'light-green'])
  .next(field, context => [0, 'Name', context.note.title])
  .next(field, context => [1, 'Labels', context.note.labels])
  .next(field, context => [2, 'Text', context.note.title])
  .next(note, context => [context.note.title, 'light-green']);

noteNew
  .next(action, ['Remove'])
  .next(note, context => [context.note.title, 'light-gray'])
  .next(action, ['Save'])
  .next(note, context => [context.note.title, '-'])
  .as('Add and remove note before save');

const noteOne = noteNew
  .next(action, ['Save'])
  .next(toast, ['Saving...'])
  .next(toast, ['Saved.'])
  .next(note, context => [context.note.title]);

noteOne.as('Add note');

noteOne
  .with(context => ({
    note: Object.assign({}, context.note, {
      text: faker.lorem.paragraphs()
    })
  }))
  .next(select, context => [context.note.title])
  .next(action, ['Edit'])
  .next(field, context => [2, 'Text', context.note.text])
  .next(note, context => [context.note.title, 'light-blue'])
  .next(action, ['Save'])
  .next(toast, ['Saving...'])
  .next(toast, ['Saved.'])
  .next(note, context => [context.note.title])
  .as('Add and edit note');

noteOne
  .next(select, context => [context.note.title])
  .next(action, ['Edit'])
  .next(action, ['Remove'])
  .next(note, context => [context.note.title, 'light-red'])
  .next(action, ['Save'])
  .next(note, context => [context.note.title, '-'])
  .next(toast, ['Saving...'])
  .next(toast, ['Saved.'])
  .as('Add and remove note');

noteOne
  .next(action, ['Create'])
  .next(note, ['(untitled)', 'light-green'])
  .next(field, context => [
    1,
    'Labels',
    context.note.labels,
    {useAutocomplete: true}
  ])
  .as('Add autocompleted labels');
