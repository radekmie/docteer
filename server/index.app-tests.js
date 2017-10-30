// @flow

import faker from 'faker';

import {before} from 'meteor/universe:e2e'; // $FlowFixMe: No local file.
import {describe} from 'meteor/universe:e2e'; // $FlowFixMe: No local file.

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

faker.user = () => ({
  email: faker.internet.email(),
  password: faker.internet.password()
});

//

before(() => {
  resize(1024, 768);
});

describe('Log in fail', () => {
  const user = faker.user();

  start('/');
  navigate('Log In');
  login(user);
  toast('Logging in...');
  toast("Sounds good, doesn't work.");
});

describe('Sign in fail', () => {
  const user = faker.user();

  start('/');
  navigate('Log In');
  click('[href="/r"]');
  signin(user);
  toast('Signing in...');
  toast('Signed in.');
  toast('Logging in...');
  toast('Logged in.');
  toast('Loading...');
  toast('Loaded.');
  logout();
  click('[href="/r"]');
  signin(user);
  toast('Signing in...');
  toast('User already exists.');
});

describe('Log in success', () => {
  const user = faker.user();

  start('/');
  navigate('Log In');
  click('[href="/r"]');
  signin(user);
  toast('Signing in...');
  toast('Signed in.');
  toast('Logging in...');
  toast('Logging in...');
  toast('Logged in.');
  toast('Loading...');
  toast('Loaded.');
  logout();
  toast('Logging out...');
  toast('Logged out.');
});

describe('Add note', () => {
  const user = faker.user();
  const title = faker.lorem.words();

  start('/');
  navigate('Log In');
  click('[href="/r"]');
  signin(user);
  toast('Signing in...');
  toast('Signed in.');
  toast('Logging in...');
  toast('Logged in.');
  toast('Loading...');
  toast('Loaded.');
  navigate('Notes');
  action('Create');
  note('(untitled)', 'light-green');
  field(0, 'Name', title);
  field(1, 'Labels', [faker.lorem.word(), faker.lorem.word()]);
  field(2, 'Text', faker.lorem.paragraphs());
  note(title, 'light-green');
  action('Save');
  toast('Saving...');
  toast('Saved.');
  note(title);
  logout();
  toast('Logging out...');
  toast('Logged out.');
});

describe('Add and edit note', () => {
  const user = faker.user();
  const title = faker.lorem.words();

  start('/');
  navigate('Log In');
  click('[href="/r"]');
  signin(user);
  toast('Signing in...');
  toast('Signed in.');
  toast('Logging in...');
  toast('Logged in.');
  toast('Loading...');
  toast('Loaded.');
  navigate('Notes');
  action('Create');
  note('(untitled)', 'light-green');
  field(0, 'Name', title);
  field(1, 'Labels', [faker.lorem.word(), faker.lorem.word()]);
  field(2, 'Text', faker.lorem.paragraphs());
  note(title, 'light-green');
  action('Save');
  toast('Saving...');
  toast('Saved.');
  note(title);
  select(title);
  action('Edit');
  field(2, 'Text', faker.lorem.paragraphs());
  note(title, 'light-blue');
  action('Save');
  toast('Saving...');
  toast('Saved.');
  note(title);
  logout();
  toast('Logging out...');
  toast('Logged out.');
});

describe('Add and remove note before save', () => {
  const user = faker.user();
  const title = faker.lorem.words();

  start('/');
  navigate('Log In');
  click('[href="/r"]');
  signin(user);
  toast('Signing in...');
  toast('Signed in.');
  toast('Logging in...');
  toast('Logged in.');
  toast('Loading...');
  toast('Loaded.');
  navigate('Notes');
  action('Create');
  note('(untitled)', 'light-green');
  field(0, 'Name', title);
  field(1, 'Labels', [faker.lorem.word(), faker.lorem.word()]);
  field(2, 'Text', faker.lorem.paragraphs());
  note(title, 'light-green');
  action('Remove');
  note(title, 'light-gray');
  action('Save');
  note(title, '-');
  logout();
  toast('Logging out...');
  toast('Logged out.');
});

describe('Add and remove note', () => {
  const user = faker.user();
  const title = faker.lorem.words();

  start('/');
  navigate('Log In');
  click('[href="/r"]');
  signin(user);
  toast('Signing in...');
  toast('Signed in.');
  toast('Logging in...');
  toast('Logged in.');
  toast('Loading...');
  toast('Loaded.');
  navigate('Notes');
  action('Create');
  note('(untitled)', 'light-green');
  field(0, 'Name', title);
  field(1, 'Labels', [faker.lorem.word(), faker.lorem.word()]);
  field(2, 'Text', faker.lorem.paragraphs());
  note(title, 'light-green');
  action('Save');
  toast('Saving...');
  toast('Saved.');
  note(title);
  select(title);
  action('Edit');
  action('Remove');
  note(title, 'light-red');
  action('Save');
  note(title, '-');
  toast('Saving...');
  toast('Saved.');
  logout();
  toast('Logging out...');
  toast('Logged out.');
});

describe('Change password incorrect', () => {
  const user1 = faker.user();
  const user2 = faker.user();

  start('/');
  navigate('Log In');
  click('[href="/r"]');
  signin(user1);
  toast('Signing in...');
  toast('Signed in.');
  toast('Logging in...');
  toast('Logged in.');
  toast('Loading...');
  toast('Loaded.');
  navigate('Settings');
  expand('Change password');
  type('#current', user2.password);
  type('#new1', user2.password);
  type('#new2', user2.password);
  click('[title="Change password"]');
  toast('Changing password...');
  toast('Incorrect old password.');
  logout();
});

describe('Change password mismatch', () => {
  const user1 = faker.user();
  const user2 = faker.user();

  start('/');
  navigate('Log In');
  click('[href="/r"]');
  signin(user1);
  toast('Signing in...');
  toast('Signed in.');
  toast('Logging in...');
  toast('Logged in.');
  toast('Loading...');
  toast('Loaded.');
  navigate('Settings');
  expand('Change password');
  type('#current', user1.password);
  type('#new1', user1.password);
  type('#new2', user2.password);
  click('[title="Change password"]');
  toast('Changing password...');
  toast('Passwords mismatch.');
  logout();
});

describe('Change password', () => {
  const user1 = faker.user();
  const user2 = faker.user();

  user2.email = user1.email;

  start('/');
  navigate('Log In');
  click('[href="/r"]');
  signin(user1);
  toast('Signing in...');
  toast('Signed in.');
  toast('Logging in...');
  toast('Logged in.');
  toast('Loading...');
  toast('Loaded.');
  navigate('Settings');
  expand('Change password');
  type('#current', user1.password);
  type('#new1', user2.password);
  type('#new2', user2.password);
  click('[title="Change password"]');
  toast('Changing password...');
  toast('Changed password.');
  logout();
  toast('Logging out...');
  toast('Logged out.');
  wait(1500);
  navigate('Log In');
  login(user2);
  toast('Logging in...');
  toast('Logged in.');
  toast('Loading...');
  toast('Loaded.');
  logout();
  toast('Logging out...');
  toast('Logged out.');
});
