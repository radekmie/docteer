// @flow

import faker from 'faker';

import {DAG} from '@tests/helpers';
import {browserClose} from '@tests/actions';
import {browserOpen} from '@tests/actions';
import {load} from '@tests/actions';
import {resize} from '@tests/actions';

// $FlowFixMe: Generics.
export default DAG.create()
  .with(() => ({
    user: {
      email: (faker.internet.email(): string),
      password: (faker.internet.password(): string)
    }
  }))
  .with(browserOpen)
  .dead(browserClose)
  .next(resize, [1024, 768])
  .next(load, ['/']);
