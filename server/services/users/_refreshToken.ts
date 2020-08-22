import jwt from 'jsonwebtoken';

import { method } from '..';
import { APIContextType } from '../../../types';
import config from '../../config';

type Params = {};

export async function handle(input: Params, context: APIContextType) {
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

export const schema = {
  type: 'object',
  properties: {},
  required: [],
  additionalProperties: false,
};

export default method(handle, schema);
