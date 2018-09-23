// @flow

import * as notes from './lib';
import * as schemas from '../../schemas';
import {endpoint} from '../../util';

import type {PatchType} from '../../../../types.flow';

endpoint('GET', '/notes', {
  schema: {
    type: 'object',
    properties: {
      refresh: {type: 'integer', minimum: 0}
    },
    required: ['refresh'],
    additionalProperties: false
  },

  handle({refresh}: {|refresh: number|}): Promise<PatchType<*, *, *>> {
    return notes.byUser(this.userId, refresh);
  }
});

// $FlowFixMe
endpoint('POST', '/notes', {
  schema: {
    type: 'object',
    properties: {
      created: {type: 'array', items: {type: 'string'}},
      refresh: {type: 'integer', minimum: 0},
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
          required: ['_id', '_outline', '_outname'],
          additionalProperties: false
        }
      }
    },
    required: ['created', 'refresh', 'removed', 'updated'],
    additionalProperties: false
  },

  async handle({
    patch,
    refresh
  }: {|
    patch: PatchType<*, *, *>,
    refresh: number
  |}): Promise<PatchType<*, *, *>> {
    await notes.patch(patch, this.userId);
    const result = await notes.byUser(this.userId, refresh);

    if (patch.removed.length) await notes.archive();

    return result;
  }
});
