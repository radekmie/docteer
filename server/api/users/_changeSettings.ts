import { APIContextType, SchemaType } from '../../../types';
import { APIError, method } from '../../lib';
import * as schemas from '../../schemas';

function _hasDuplicatedField(schema: SchemaType) {
  return schema.fields
    .map(field => field.name)
    .some((name, index, fields) => fields.indexOf(name) !== index);
}

type Params = { schemas: SchemaType[] };

async function handle(input: Params, context: APIContextType) {
  if (input.schemas.some(_hasDuplicatedField)) {
    throw new APIError({ code: 'schema-field-duplicated' });
  }

  const { Users } = context.collections;
  const { value } = await Users.findOneAndUpdate(
    { _id: context.userId },
    { $set: input },
    {
      projection: { _id: 0, schemas: 1 },
      returnOriginal: false,
      session: context.session,
    },
  );

  return value!;
}

const schema = {
  type: 'object',
  properties: {
    schemas: {
      type: 'array',
      items: schemas.schema,
    },
  },
  required: ['schemas'],
  additionalProperties: false,
};

export const changeSettings = method(handle, schema);
