import { ObjectId } from 'mongodb';

import { method } from '..';
import { APIContextType } from '../../../types';

type Params = { _id: ObjectId | string };

export async function handle({ _id }: Params, context: APIContextType) {
  const { Users } = context.collections;
  return await Users.findOne({ _id }, { session: context.session });
}

export const schema = {
  type: 'object',
  properties: {
    _id: {
      anyOf: [{ instanceof: 'ObjectId' }, { type: 'string' }],
    },
  },
  required: ['_id'],
  additionalProperties: false,
};

export default method(handle, schema);
