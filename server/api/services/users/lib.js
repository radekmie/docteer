// @flow

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {ObjectId} from 'mongodb';

import * as notes from '@server/api/services/notes/lib';
import config from '@server/config';
import {APIError} from '@server/api';

import type {APIContextType} from '@types';
import type {PassType} from '@types';
import type {PatchType} from '@types';
import type {SchemaType} from '@types';

const defaultPatch: PatchType<> = {
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
        '<div class="flex flex-center w-100" style="width: 680px; background: aliceblue;"><div class="flex-1"><p class="big pl4"><br>A simple way to store everything.<br>With<span>&nbsp;</span><b>DocTeer</b><span>&nbsp;</span>your data are easier to use.<br><br><a href="https://docteer.com/signup">Sign up</a>.</p></div></div>',
      what:
        "You start with an almost empty data collection, with just a 'read me' doc to scan through. To ginger up your party, you need to define some templates (settings icon on the left) and then create your own documents. Remember to save them when finished (accept icon). Play around for yourself!",
      why:
        'To introduce order into your catalogues and notes by getting a grab of whatever can be conceived as a text through functionalities built-in into DocTeer: filtering, labelling, fuzzy search, import/export...'
    }
  ]
};

const defaultSchemas: SchemaType<>[] = [
  {name: 'Default', fields: {name: 'textarea', labels: 'ul', text: 'div'}}
];

export async function byId({_id}: {|_id: string|}, context: APIContextType) {
  const {Users} = context.collections;
  return await Users.findOne({_id}, {session: context.session});
}

export async function changePassword(
  {new1, new2, old}: {|new1: PassType, new2: PassType, old: PassType|},
  context: APIContextType
) {
  if (new1.digest !== new2.digest)
    throw new APIError({code: 'user-password-mismatch'});

  const digest = context.user.services.password.bcrypt;
  if (!(await bcrypt.compare(old.digest, digest)))
    throw new APIError({code: 'user-password-incorrect'});

  if (
    context.user.emails &&
    context.user.emails.length > 0 &&
    context.user.emails[0].address === 'demo@docteer.com'
  ) {
    // NOTE: Should we throw an error here?
    return {};
  }

  const {Users} = context.collections;
  await Users.updateOne(
    {_id: context.userId},
    {$set: {'services.password.bcrypt': await bcrypt.hash(new1.digest, 10)}},
    {session: context.session}
  );

  return {};
}

export async function changeSettings(
  input: {|schemas: SchemaType<>[]|},
  context: APIContextType
) {
  const {Users} = context.collections;
  const {value} = await Users.findOneAndUpdate(
    {_id: context.userId},
    {$set: input},
    {
      projection: {_id: 0, schemas: 1},
      returnOriginal: false,
      session: context.session
    }
  );

  return value;
}

export async function login(
  {email, password}: {|email: string, password: PassType|},
  context: APIContextType
) {
  const {Users} = context.collections;
  const user = await Users.findOne(
    {'emails.address': email},
    {session: context.session}
  );

  if (
    !user ||
    !user.services ||
    !user.services.password ||
    !user.services.password.bcrypt ||
    !(await bcrypt.compare(password.digest, user.services.password.bcrypt))
  )
    throw new APIError({code: 'user-invalid-credentials'});

  context.user = user;
  context.userId = user._id;

  return refreshToken({}, context);
}

export async function refreshToken(input: {}, context: APIContextType) {
  return {
    emails: context.user.emails,
    schemas: context.user.schemas,
    token: jwt.sign(
      {
        exp: Math.floor(Date.now() / 1000) + config.jwt.exp,
        sub: context.user._id
      },
      config.jwt.secret
    )
  };
}

export async function register(
  {email, password}: {|email: string, password: PassType|},
  context: APIContextType
) {
  const {Users} = context.collections;

  let _id;
  try {
    const result = await Users.insertOne(
      {
        createdAt: new Date(),
        services: {password: {bcrypt: await bcrypt.hash(password.digest, 10)}},
        emails: [{address: email}],
        schemas: defaultSchemas
      },
      {session: context.session}
    );

    _id = result.insertedId;
  } catch (error) {
    if (error.codeName) throw new APIError({code: 'user-already-exists'});
    throw error;
  }

  const user = await Users.findOne(
    {_id: new ObjectId(_id)},
    {session: context.session}
  );

  context.user = user;
  context.userId = user._id;

  await notes.patchMine({patch: defaultPatch, refresh: Infinity}, context);

  return refreshToken({}, context);
}
