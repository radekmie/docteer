import jwt from 'jsonwebtoken';

import { APIContextType } from '../../../types';
import config from '../../config';
import { method } from '../../lib';

type Params = {};

async function handle(input: Params, context: APIContextType) {
  return {
    emails: context.user.emails,
    schemas: context.user.schemas,
    token: jwt.sign(
      {
        exp: Math.floor(Date.now() / 1000) + config.jwt.exp,
        sub: context.user._id,
      },
      config.jwt.secret,
    ),
  };
}

const schema = {
  type: 'object',
  properties: {},
  required: [],
  additionalProperties: false,
};

export const refreshToken = method(handle, schema);
