// @flow

import SimpleSchema from 'simpl-schema';
import bcrypt from 'bcrypt';

import {Meteor} from 'meteor/meteor';
import {Random} from 'meteor/random';

import {Users} from '..';
import {endpoint} from '../../lib';

import type {PassType} from '../../../types.flow';
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
        name: 'textarea',
        labels: 'ul',
        text: 'textarea',
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
  {name: 'Default', fields: {name: 'textarea', labels: 'ul', text: 'div'}}
];

const PassSchema = new SimpleSchema({
  algorithm: {type: String, regEx: /^sha-256$/},
  digest: String
});

endpoint('POST /users/login', {
  authorize: false,

  schema: {
    email: String,
    password: PassSchema
  },

  async handle({email, password}: {|email: string, password: PassType|}) {
    const user = Users.findOne({'emails.address': email});

    if (
      !user ||
      !user.services ||
      !user.services.password ||
      !user.services.password.bcrypt ||
      !(await bcrypt.compare(password.digest, user.services.password.bcrypt))
    )
      throw new Meteor.Error('invalid-auth', "Sounds good, doesn't work.");

    return {
      _id: user._id,
      emails: user.emails,
      schemas: user.schemas
    };
  }
});

endpoint('POST /users/password', {
  schema: {
    new1: PassSchema,
    new2: PassSchema,
    old: PassSchema
  },

  async handle({
    new1,
    new2,
    old
  }: {|
    new1: PassType,
    new2: PassType,
    old: PassType
  |}) {
    if (new1.digest !== new2.digest)
      throw new Meteor.Error('password-mismatch', 'Passwords mismatch.');

    const user = Users.findOne({_id: this.userId});

    if (!user) throw new Meteor.Error('user-not-found', 'User not found.');

    if (!(await bcrypt.compare(old.digest, user.services.password.bcrypt)))
      throw new Meteor.Error('password-incorrect', 'Incorrect old password.');

    if (
      user.emails &&
      user.emails.length &&
      user.emails[0].address === 'demo@docteer.com'
    ) {
      // NOTE: Should we throw an error here?
      return;
    }

    Users.update(
      {_id: user._id},
      {$set: {'services.password.bcrypt': await bcrypt.hash(new1.digest, 10)}}
    );
  }
});

endpoint('POST /users/register', {
  authorize: false,

  schema: {
    email: String,
    password: PassSchema
  },

  async handle({email, password}: {|email: string, password: PassType|}) {
    const user = Users.findOne({'emails.address': email});
    if (user) throw new Meteor.Error('user-exists', 'User already exists.');

    const userId = Users.insert({
      _id: Random.id(),
      createdAt: new Date(),
      services: {password: {bcrypt: await bcrypt.hash(password.digest, 10)}},
      emails: [{address: email}],
      schemas: defaultSchemas
    });

    Meteor.call('POST /notes', userId, {
      patch: defaultPatch,
      refresh: Infinity
    });

    return {
      _id: userId,
      emails: [{address: email}],
      schemas: defaultSchemas
    };
  }
});

endpoint('POST /users/settings', {
  schema: {
    schemas: Array,
    'schemas.$': Object,
    'schemas.$.name': String,
    'schemas.$.fields': {
      type: Object,
      blackbox: true,
      custom() {
        const entries = Object.entries(this.value);

        const pattern = /^[^$_][^.]*$/;
        const invalid = entries.find(entry => !pattern.test(entry[0]));
        if (invalid) return 'regEx';

        const allowed = ['div', 'ol', 'ul', 'textarea'];
        const unknown = entries.find(entry => !allowed.includes(entry[1]));
        if (unknown) return 'notAllowed';

        return undefined;
      }
    }
  },

  handle(settings: {|schemas: SchemaType<*>[]|}) {
    Users.update({_id: this.userId}, {$set: settings});
  }
});
