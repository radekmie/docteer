// @flow

import * as schemas from '@server/api/schemas';
import * as users from '@server/api/services/users/lib';
import {endpoint} from '@server/api';

endpoint('POST', '/users/login', {
  authorize: false,
  async handle(input, context) {
    return await users.login(input, context);
  },
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
  async handle(input, context) {
    return await users.changePassword(input, context);
  },
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
  async handle(input, context) {
    return await users.register(input, context);
  },
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

endpoint('POST', '/users/settings', {
  async handle(input, context) {
    return await users.changeSettings(input, context);
  },
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

endpoint('GET', '/users/token', {
  async handle(input, context) {
    return await users.refreshToken(input, context);
  },
  schema: {
    type: 'object',
    properties: {},
    required: [],
    additionalProperties: false
  }
});
