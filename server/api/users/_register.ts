import bcrypt from 'bcryptjs';
import cloneDeep from 'lodash/cloneDeep';
import { ObjectId } from 'mongodb';

import * as api from '..';
import {
  APIContextType,
  PassType,
  PatchType,
  SchemaType,
} from '../../../types';
import { APIError, method } from '../../lib';
import * as schemas from '../../schemas';

const defaultPatch: PatchType = {
  created: ['introduction'],
  removed: [],
  updated: [
    {
      _id: 'introduction',
      _outname: 'Introduction',
      _outline: [
        { name: 'name', type: 'textarea' },
        { name: 'labels', type: 'ul' },
        { name: 'text', type: 'textarea' },
        { name: 'points', type: 'ul' },
        { name: 'list', type: 'ol' },
        { name: 'snippet', type: 'div' },
        { name: 'what', type: 'div' },
        { name: 'why', type: 'div' },
      ],
      name: 'Introduction to DocTeer',
      labels: [],
      text: 'DocTeer is a multi-purpose data container.',
      points: [
        'Whatever has a form of a text,',
        'a list,',
        'a numbered list,',
        'or a snippet...',
      ],
      list: [
        '...can be easily stored into it,',
        'and then searched for,',
        'dynamically aggregated,',
        'with light-fast fuzzy search functionality and labelling/filtering mechanism.',
      ],
      snippet:
        '<div className="flex flex-center w-100" style="width: 680px; background: aliceblue;"><div className="flex-1"><p className="big pl4"><br>A simple way to store everything.<br>With<span>&nbsp;</span><b>DocTeer</b><span>&nbsp;</span>your data are easier to use.<br><br><a href="https://docteer.com/signup">Sign up</a>.</p></div></div>',
      what:
        "You start with an almost empty data collection, with just a 'read me' doc to scan through. To ginger up your party, you need to define some templates (settings icon on the left) and then create your own documents. Remember to save them when finished (accept icon). Play around for yourself!",
      why:
        'To introduce order into your catalogues and notes by getting a grab of whatever can be conceived as a text through functionalities built-in into DocTeer: filtering, labelling, fuzzy search, import/export...',
    },
  ],
};

const defaultSchemas: SchemaType[] = [
  {
    name: 'Default',
    fields: [
      { name: 'name', type: 'textarea' },
      { name: 'labels', type: 'ul' },
      { name: 'text', type: 'div' },
    ],
  },
];

type Params = { email: string; password: PassType };

async function handle({ email, password }: Params, context: APIContextType) {
  const { Users } = context.collections;

  let _id;
  try {
    const result = await Users.insertOne(
      {
        createdAt: new Date(),
        services: {
          password: { bcrypt: await bcrypt.hash(password.digest, 10) },
        },
        emails: [{ address: email }],
        schemas: defaultSchemas,
      },
      { session: context.session },
    );

    _id = result.insertedId;
  } catch (error) {
    // "MongoError: E11000 duplicate key error collection...""
    if (error.code === 11000) {
      throw new APIError({ code: 'user-already-exists' });
    }
    throw error;
  }

  const user = await Users.findOne(
    { _id: new ObjectId(_id) },
    { session: context.session },
  );

  context.user = user!;
  context.userId = user!._id;

  await api.notes.patchMine.run(
    { patch: cloneDeep(defaultPatch), refresh: Infinity },
    context,
  );

  return api.users.refreshToken.run({}, context);
}

const schema = {
  type: 'object',
  properties: {
    email: schemas.email,
    password: schemas.password,
  },
  required: ['email', 'password'],
  additionalProperties: false,
};

export const register = method(handle, schema);
