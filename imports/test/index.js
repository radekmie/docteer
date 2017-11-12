// @flow

import faker from 'faker';

import {before} from 'meteor/universe:e2e';

import {load} from './actions';
import {navigate} from './actions';
import {noteAction} from './actions';
import {noteCheck} from './actions';
import {noteField} from './actions';
import {noteSelect} from './actions';
import {resize} from './actions';
import {toastCheck} from './actions';
import {userChangePassword} from './actions';
import {userLogIn} from './actions';
import {userLogOut} from './actions';
import {userSignIn} from './actions';
import {wait} from './actions';

import {DAG} from './helpers';

//

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
  .next(load, ['/']);

base
  .next(userLogIn, context => [context.user])
  .next(toastCheck, ['Logging in...'])
  .next(toastCheck, ["Sounds good, doesn't work."])
  .save('Log in fail');

const user = base
  .next(userSignIn, context => [context.user])
  .next(toastCheck, ['Signing in...'])
  .next(toastCheck, ['Signed in.'])
  .next(toastCheck, ['Logging in...'])
  .next(toastCheck, ['Logged in.'])
  .next(toastCheck, ['Loading...'])
  .next(toastCheck, ['Loaded.'])
  .last(userLogOut, [])
  .last(toastCheck, ['Logging out...'])
  .last(toastCheck, ['Logged out.']);

user.save('Log in success');

user
  .last(userSignIn, context => [context.user])
  .last(toastCheck, ['Signing in...'])
  .last(toastCheck, ['User already exists.'])
  .save('Sign in fail');

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

user
  .with(() => ({password: faker.internet.password()}))
  .next(userChangePassword, context => [
    {
      current: context.user.password,
      new1: context.password,
      new2: context.password
    }
  ])
  .with(context => ({
    user: Object.assign({}, context.user, {
      password: context.password
    })
  }))
  .next(toastCheck, ['Changing password...'])
  .next(toastCheck, ['Changed password.'])
  .next(userLogOut, [])
  .next(toastCheck, ['Logging out...'])
  .next(toastCheck, ['Logged out.'])
  .next(wait, [1500])
  .next(userLogIn, context => [context.user])
  .next(toastCheck, ['Logging in...'])
  .next(toastCheck, ['Logged in.'])
  .next(toastCheck, ['Loading...'])
  .next(toastCheck, ['Loaded.'])
  .save('Change password');

const noteNew = user
  .with(() => ({
    note: {
      labels: [
        'a' + (faker.lorem.word(): string),
        'b' + (faker.lorem.word(): string),
        'c' + (faker.lorem.word(): string)
      ],
      text: (faker.lorem.paragraphs(): string),
      title: (faker.lorem.words(): string)
    }
  }))
  .next(navigate, ['notes'])
  .next(noteAction, ['create'])
  .next(noteCheck, ['(untitled)', 'light-green'])
  .next(noteField, context => [0, 'Name', context.note.title])
  .next(noteField, context => [1, 'Labels', context.note.labels])
  .next(noteField, context => [2, 'Text', context.note.title])
  .next(noteCheck, context => [context.note.title, 'light-green']);

noteNew
  .next(noteAction, ['remove'])
  .next(noteCheck, context => [context.note.title, 'light-gray'])
  .next(noteAction, ['save'])
  .next(noteCheck, context => [context.note.title, '-'])
  .save('Add and remove note before save');

const noteOne = noteNew
  .next(noteAction, ['save'])
  .next(toastCheck, ['Saving...'])
  .next(toastCheck, ['Saved.'])
  .next(noteCheck, context => [context.note.title]);

noteOne.save('Add note');

noteOne
  .with(context => ({
    note: Object.assign({}, context.note, {
      text: faker.lorem.paragraphs()
    })
  }))
  .next(noteSelect, context => [context.note.title])
  .next(noteAction, ['edit'])
  .next(noteField, context => [2, 'Text', context.note.text])
  .next(noteCheck, context => [context.note.title, 'light-blue'])
  .next(noteAction, ['save'])
  .next(toastCheck, ['Saving...'])
  .next(toastCheck, ['Saved.'])
  .next(noteCheck, context => [context.note.title])
  .save('Add and edit note');

noteOne
  .next(noteSelect, context => [context.note.title])
  .next(noteAction, ['edit'])
  .next(noteAction, ['remove'])
  .next(noteCheck, context => [context.note.title, 'light-red'])
  .next(noteAction, ['save'])
  .next(noteCheck, context => [context.note.title, '-'])
  .next(toastCheck, ['Saving...'])
  .next(toastCheck, ['Saved.'])
  .save('Add and remove note');

noteOne
  .next(noteAction, ['create'])
  .next(noteCheck, ['(untitled)', 'light-green'])
  .next(noteField, context => [
    1,
    'Labels',
    context.note.labels,
    {useAutocomplete: true}
  ])
  .save('Add autocompleted labels');
