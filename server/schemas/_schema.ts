import * as schemas from './';

export const schema = {
  type: 'object',
  properties: {
    fields: schemas.outline,
    name: { type: 'string' },
  },
  required: ['fields', 'name'],
  additionalProperties: false,
};
