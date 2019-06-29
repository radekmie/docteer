// @flow

import jwt from 'jsonwebtoken';

import config from '@server/config';
import {method} from '@server/services';

import type {APIContextType} from '@types';

type Params = {||};

export async function handle(input: Params, context: APIContextType) {
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

export const schema = {
  type: 'object',
  properties: {},
  required: [],
  additionalProperties: false
};

export default method<Params, _, _>(handle, schema);
