// @flow

import * as schemas from '@server/schemas';

export const schema = {
  type: 'object',
  properties: {
    fields: schemas.outline,
    name: {type: 'string'}
  },
  required: ['fields', 'name'],
  additionalProperties: false
};
