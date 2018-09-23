// @flow

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {ObjectId} from 'mongodb';

import * as notes from '../notes/lib';
import {APIError} from '../../util/APIError';
import {db} from '../../mongo';

import type {PassType} from '../../../../imports/types.flow';
import type {PatchType} from '../../../../imports/types.flow';
import type {SchemaType} from '../../../../imports/types.flow';

const users = () => db().then(db => db.collection('users'));

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

export async function byId({_id}: {|_id: string|}) {
  const Users = await users();
  return Users.findOne({_id});
}

// prettier-ignore
export async function login({email, password}: {|email: string, password: PassType|}) {
  const Users = await users();
  const user = await Users.findOne({'emails.address': email});

  if (
    !user ||
    !user.services ||
    !user.services.password ||
    !user.services.password.bcrypt ||
    !(await bcrypt.compare(password.digest, user.services.password.bcrypt))
  )
    throw new APIError({code: 'user-invalid-credentials'});

  return {
    emails: user.emails,
    schemas: user.schemas,
    token: jwt.sign(
      {exp: Math.floor(Date.now() / 1000) + 60 * 60, sub: user._id},
      'SECRET'
    )
  };
}

// prettier-ignore
export async function password({new1, new2, old}: {|new1: PassType, new2: PassType, old: PassType|}) {
  if (new1.digest !== new2.digest)
    throw new APIError({code: 'user-password-mismatch'});

  if (!(await bcrypt.compare(old.digest, this.user.services.password.bcrypt)))
    throw new APIError({code: 'user-password-incorrect'});

  if (
    this.user.emails &&
    this.user.emails.length &&
    this.user.emails[0].address === 'demo@docteer.com'
  ) {
    // NOTE: Should we throw an error here?
    return {};
  }

  const Users = await users();
  Users.updateOne(
    {_id: this.userId},
    {$set: {'services.password.bcrypt': await bcrypt.hash(new1.digest, 10)}}
  );

  return {};
}

// prettier-ignore
export async function register({email, password}: {|email: string, password: PassType|}) {
  const Users = await users();
  const user = await Users.findOne({'emails.address': email});
  if (user) throw new APIError({code: 'user-already-exists'});

  const {insertedId} = await Users.insertOne({
    createdAt: new Date(),
    services: {password: {bcrypt: await bcrypt.hash(password.digest, 10)}},
    emails: [{address: email}],
    schemas: defaultSchemas
  });

  this.userId = new ObjectId(insertedId);
  notes.patch(defaultPatch, this.userId);

  return {
    emails: [{address: email}],
    schemas: defaultSchemas,
    token: jwt.sign(
      {exp: Math.floor(Date.now() / 1000) + 60 * 60, sub: this.userId},
      'SECRET'
    )
  };
}

export async function settings(settings: {|schemas: SchemaType<*>[]|}) {
  const Users = await users();
  return Users.updateOne({_id: this.userId}, {$set: settings});
}
