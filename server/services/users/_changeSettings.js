// @flow

import * as schemas from '@server/schemas';
import {APIError} from '@server/api';
import {method} from '@server/services';

import type {APIContextType, SchemaType} from '@types';

function _hasDuplicatedField(schema) {
  return schema.fields
    .map(field => field.name)
    .some((name, index, fields) => fields.indexOf(name) !== index);
}

type Params = {|schemas: SchemaType<>[]|};

export async function handle(input: Params, context: APIContextType) {
  if (input.schemas.some(_hasDuplicatedField))
    throw new APIError({code: 'schema-field-duplicated'});

  const {Users} = context.collections;
  const {value} = await Users.findOneAndUpdate(
    {_id: context.userId},
    {$set: input},
    {
      projection: {_id: 0, schemas: 1},
      returnOriginal: false,
      session: context.session
    }
  );

  return value;
}

export const schema = {
  type: 'object',
  properties: {
    schemas: {
      type: 'array',
      items: schemas.schema
    }
  },
  required: ['schemas'],
  additionalProperties: false
};

export default method<Params, _, _>(handle, schema);
