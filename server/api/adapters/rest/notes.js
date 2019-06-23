// @flow

import * as notes from '@server/api/services/notes';
import * as schemas from '@server/api/schemas';
import {endpoint} from '@server/api';

endpoint('GET', '/notes', {
  handle: notes.getMine,
  schema: {
    type: 'object',
    properties: {
      refresh: {type: 'integer', minimum: 0}
    },
    required: ['refresh'],
    additionalProperties: false
  }
});

endpoint('POST', '/notes', {
  handle: notes.patchMine,
  schema: {
    type: 'object',
    properties: {
      patch: {
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
      },
      refresh: {type: 'integer', minimum: 0}
    },
    required: ['patch', 'refresh'],
    additionalProperties: false
  }
});
