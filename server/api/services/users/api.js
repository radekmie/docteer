// @flow

import * as schemas from '../../schemas';
import * as users from './lib';
import {endpoint} from '../../util';

endpoint('POST', '/users/login', {
  authorize: false,
  handle: users.login,
  schema: {
    type: 'object',
    properties: {
      email: schemas.email,
      password: schemas.password
    },
    required: ['email', 'password'],
    additionalProperties: false
  }
});

endpoint('POST', '/users/password', {
  handle: users.password,
  schema: {
    type: 'object',
    properties: {
      new1: schemas.password,
      new2: schemas.password,
      old: schemas.password
    },
    required: ['new1', 'new2', 'old'],
    additionalProperties: false
  }
});

endpoint('POST', '/users/register', {
  authorize: false,
  handle: users.register,
  schema: {
    type: 'object',
    properties: {
      email: schemas.email,
      password: schemas.password
    },
    required: ['email', 'password'],
    additionalProperties: false
  }
});

// $FlowFixMe
endpoint('POST', '/users/settings', {
  handle: users.settings,
  schema: {
    type: 'object',
    properties: {
      schemas: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            fields: schemas.outline,
            name: {type: 'string'}
          },
          required: ['fields', 'name'],
          additionalProperties: false
        }
      }
    },
    required: ['schemas'],
    additionalProperties: false
  }
});
