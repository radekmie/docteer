import { ObjectId } from 'mongodb';

import { APIContextType } from '../../../types';
import { method } from '../../lib';

type Params = { _id: ObjectId | string };

async function handle({ _id }: Params, context: APIContextType) {
  const { Users } = context.collections;
  return await Users.findOne({ _id }, { session: context.session });
}

const schema = {
  type: 'object',
  properties: {
    _id: {
      anyOf: [{ instanceof: 'ObjectId' }, { type: 'string' }],
    },
  },
  required: ['_id'],
  additionalProperties: false,
};

export const byId = method(handle, schema);
