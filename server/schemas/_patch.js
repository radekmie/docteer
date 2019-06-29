// @flow

import * as schemas from '@server/schemas';

export const patch = {
  type: 'object',
  properties: {
    created: {type: 'array', items: {type: 'string'}},
    removed: {type: 'array', items: {type: 'string'}},
    updated: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          _id: {type: 'string'},
          _outline: schemas.outline,
          _outname: {type: 'string'}
        },
        patternProperties: {
          '^[^$_][^.]*$': {
            type: ['array', 'string'],
            items: {type: 'string'}
          }
        },
        required: ['_id'],
        additionalProperties: false
      }
    }
  },
  required: ['created', 'removed', 'updated'],
  additionalProperties: false
};
