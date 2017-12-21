// @flow

import {Accounts} from 'meteor/accounts-base';
import {Match} from 'meteor/check';
import {Meteor} from 'meteor/meteor';
import {check} from 'meteor/check';

import {endpoint} from '../../lib';

import type {PatchType} from '../../../types.flow';
import type {SchemaType} from '../../../types.flow';

const defaultPatch: PatchType<*, *, *> = {
  created: ['introduction'],
  removed: [],
  updated: [
    {
      _id: 'introduction',
      _outname: 'Introduction',
      _outline: {
        name: 'div',
        labels: 'ul',
        text: 'div',
        points: 'ul',
        list: 'ol',
        snippet: 'div',
        what: 'div',
        why: 'div'
      },
      name: 'Introduction to DocTeer',
      labels: [],
      text: 'DocTeer is a multi-purpose data container.',
      points: [
        'Whatever has a form of a text,',
        'a list,',
        'a numbered list,',
        'or a snippet...'
      ],
      list: [
        '...can be easily stored into it,',
        'and then searched for,',
        'dynamically aggregated,',
        'with light-fast fuzzy search functionality and labelling/filtering mechanism.'
      ],
      snippet:
        '<div class="flex flex-center w-100" style="width: 680px; background: aliceblue;"><div class="flex-1"><p class="big pl4"><br class="Apple-interchange-newline">A simple way to store everything.<br>With<span class="Apple-converted-space">&nbsp;</span><b>DocTeer</b><span class="Apple-converted-space">&nbsp;</span>your data are easier to use.<br><br><a href="https://docteer.com/signup">Sign up</a>.</p></div></div><div class="bg-dark-gray center fixed hidden near-white pa3 w5" style="left: 720px; top: 368.5px;"><div class="flex flex-between flex-end"><b>Keyboard Shortcuts</b><small>ESC to close</small></div><hr><div class="flex flex-between"><b><code>?</code></b><i>Show help</i></div><div class="flex flex-between"><b><code>↑</code></b><i>Previous note</i></div><div class="flex flex-between"><b><code>↓</code></b><i>Next note</i></div><div class="flex flex-between"><b><code>←</code></b><i>Previous filter</i></div><div class="flex flex-between"><b><code>→</code></b><i>Next filter</i></div><div class="flex flex-between"><b><code>Enter</code></b><i>Toggle note/filter</i></div></div>',
      what:
        "You start with an almost empty data collection, with just a 'read me' doc to scan through. To ginger up your party, you need to define some templates (settings icon on the left) and then create your own documents. Remember to save them when finished (accept icon). Play around for yourself!",
      why:
        'To introduce order into your catalogues and notes by getting a grab of whatever can be conceived as a text through functionalities built-in into DocTeer: filtering, labelling, fuzzy search, import/export...'
    }
  ]
};

const defaultSchemas: SchemaType<*>[] = [
  {name: 'Default', fields: {name: 'div', labels: 'ul', text: 'div'}}
];

endpoint('POST /users/password', {
  handle({
    new1,
    new2,
    old
  }: {|
    new1: {|algorithm: string, digest: string|},
    new2: {|algorithm: string, digest: string|},
    old: {|algorithm: string, digest: string|}
  |}) {
    try {
      check(this.userId, String);
      check(old, {algorithm: 'sha-256', digest: String});
      check(new1, {algorithm: 'sha-256', digest: String});
      check(new2, {algorithm: 'sha-256', digest: String});
    } catch (error) {
      throw new Meteor.Error('validation-error', 'Validation error.');
    }

    if (new1.digest !== new2.digest)
      throw new Meteor.Error('password-mismatch', 'Passwords mismatch.');

    const user = Meteor.users.findOne({_id: this.userId});

    if (!user) throw new Meteor.Error('user-not-found', 'User not found.');

    if (Accounts._checkPassword(user, old).error)
      throw new Meteor.Error('password-incorrect', 'Incorrect old password.');

    // NOTE: Should we throw an error here?
    if (user.emails[0].address === 'demo@docteer.com') return;

    Accounts.setPassword(this.userId, new1, {logout: false});
  },

  schema: {
    old: {type: Object, blackbox: true},
    new1: {type: Object, blackbox: true},
    new2: {type: Object, blackbox: true}
  }
});

endpoint('POST /users/register', {
  authorize: false,
  handle({
    email,
    password
  }: {|
    email: string,
    password: {|algorithm: string, digest: string|}
  |}) {
    try {
      check(this.userId, null);
      check(email, String);
      check(password, {algorithm: 'sha-256', digest: String});
    } catch (error) {
      throw new Meteor.Error('validation-error', 'Validation error.');
    }

    let _id;
    try {
      _id = Accounts.createUser({email, password});
    } catch (error) {
      if (error.error === 403)
        throw new Meteor.Error('user-exists', 'User already exists.');
      throw error;
    }

    this.setUserId(_id);

    Meteor.users.update({_id}, {$set: {schemas: defaultSchemas}});
    Meteor.call('POST /notes', {patch: defaultPatch, refresh: Infinity});
  },

  schema: {
    email: String,
    password: {type: Object, blackbox: true}
  }
});

endpoint('POST /users/settings', {
  handle({settings}: {|settings: {|schemas: SchemaType<*>[]|}|}) {
    try {
      check(this.userId, String);
      check(settings, {schemas: [Object]});
      check(
        settings.schemas,
        Match.Where(schemas => {
          schemas.forEach(schema => {
            check(schema, {name: String, fields: Object});
            Object.keys(schema.fields).forEach(key => {
              check(schema.fields[key], Match.OneOf('div', 'ol', 'ul'));
            });
          });

          return true;
        })
      );
    } catch (error) {
      throw new Meteor.Error('validation-error', 'Validation error.');
    }

    settings.schemas.forEach(schema => {
      Object.keys(schema.fields).forEach(key => {
        if (key[0] === '$')
          throw new Meteor.Error(
            'field-with-dollar',
            'Field cannot start with a dollar sign.'
          );
        if (key.indexOf('.') !== -1)
          throw new Meteor.Error(
            'field-with-dot',
            'Field cannot contain a dot.'
          );
      });
    });

    Meteor.users.update({_id: this.userId}, {$set: settings});
  },

  schema: {
    settings: String
  }
});
