import bcrypt from 'bcryptjs';

import * as api from '..';
import { APIContextType, PassType } from '../../../types';
import { APIError, method } from '../../lib';
import * as schemas from '../../schemas';

type Params = { email: string; password: PassType };

async function handle({ email, password }: Params, context: APIContextType) {
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

  return await api.users.refreshToken.run({}, context);
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

export const login = method(handle, schema);
