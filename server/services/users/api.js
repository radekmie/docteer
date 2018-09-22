// @flow

import SimpleSchema from 'simpl-schema';

import {endpoint} from '../../lib/api';
import * as users from './lib';

const PassSchema = new SimpleSchema({
  algorithm: {type: String, regEx: /^sha-256$/},
  digest: String
});

endpoint('POST /api/users/login', {
  authorize: false,
  handle: users.login,
  schema: {
    email: String,
    password: PassSchema
  }
});

endpoint('POST /api/users/password', {
  handle: users.password,
  schema: {
    new1: PassSchema,
    new2: PassSchema,
    old: PassSchema
  }
});

endpoint('POST /api/users/register', {
  authorize: false,
  handle: users.register,
  schema: {
    email: String,
    password: PassSchema
  }
});

endpoint('POST /api/users/settings', {
  handle: users.settings,
  schema: {
    schemas: Array,
    'schemas.$': Object,
    'schemas.$.name': String,
    'schemas.$.fields': {
      type: Object,
      blackbox: true,
      custom() {
        const entries = Object.entries(this.value);

        const pattern = /^[^$_][^.]*$/;
        const invalid = entries.find(entry => !pattern.test(entry[0]));
        if (invalid) return 'regEx';

        const allowed = ['div', 'ol', 'ul', 'textarea'];
        const unknown = entries.find(entry => !allowed.includes(entry[1]));
        if (unknown) return 'notAllowed';

        return undefined;
      }
    }
  }
});
