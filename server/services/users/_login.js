// @flow

import bcrypt from 'bcryptjs';

import * as schemas from '@server/schemas';
import * as users from '@server/services/users';
import {APIError} from '@server/api';
import {method} from '@server/services';

import type {APIContextType} from '@types';
import type {PassType} from '@types';

type Params = {|email: string, password: PassType|};

export async function handle(
  {email, password}: Params,
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

  return await users.refreshToken({}, context);
}

export const schema = {
  type: 'object',
  properties: {
    email: schemas.email,
    password: schemas.password
  },
  required: ['email', 'password'],
  additionalProperties: false
};

export default method<Params, _, _>(handle, schema);
