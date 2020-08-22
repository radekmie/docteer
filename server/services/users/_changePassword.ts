import bcrypt from 'bcryptjs';

import { method } from '..';
import { APIContextType, PassType } from '../../../types';
import { APIError } from '../../api';
import * as schemas from '../../schemas';

type Params = { new1: PassType; new2: PassType; old: PassType };

export async function handle(
  { new1, new2, old }: Params,
  context: APIContextType,
) {
  if (new1.digest !== new2.digest) {
    throw new APIError({ code: 'user-password-mismatch' });
  }

  const digest = context.user.services.password.bcrypt;
  if (!(await bcrypt.compare(old.digest, digest))) {
    throw new APIError({ code: 'user-password-incorrect' });
  }

  if (
    context.user.emails &&
    context.user.emails.length > 0 &&
    context.user.emails[0].address === 'demo@docteer.com'
  ) {
    // NOTE: Should we throw an error here?
    return {};
  }

  const { Users } = context.collections;
  await Users.updateOne(
    { _id: context.userId },
    {
      $set: { 'services.password.bcrypt': await bcrypt.hash(new1.digest, 10) },
    },
    { session: context.session },
  );

  return {};
}

export const schema = {
  type: 'object',
  properties: {
    new1: schemas.password,
    new2: schemas.password,
    old: schemas.password,
  },
  required: ['new1', 'new2', 'old'],
  additionalProperties: false,
};

export default method(handle, schema);
