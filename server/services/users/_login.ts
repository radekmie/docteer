import bcrypt from 'bcryptjs';

import { APIContextType, PassType } from '../../../types';
import { APIError } from '../../api';
import * as schemas from '../../schemas';
import * as users from './';
import { method } from './..';

type Params = { email: string; password: PassType };

export async function handle(
  { email, password }: Params,
  context: APIContextType,
) {
  const { Users } = context.collections;
  const user = await Users.findOne(
    { 'emails.address': email },
    { session: context.session },
  );

  if (
    !user ||
    !user.services ||
    !user.services.password ||
    !user.services.password.bcrypt ||
    !(await bcrypt.compare(password.digest, user.services.password.bcrypt))
  ) {
    throw new APIError({ code: 'user-invalid-credentials' });
  }

  context.user = user;
  context.userId = user._id;

  return await users.refreshToken({}, context);
}

export const schema = {
  type: 'object',
  properties: {
    email: schemas.email,
    password: schemas.password,
  },
  required: ['email', 'password'],
  additionalProperties: false,
};

export default method(handle, schema);
