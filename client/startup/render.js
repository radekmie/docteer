// @flow

import {h} from 'preact';
import {render} from 'preact';

import {Application} from '../components/Application';

render(
  h(Application),
  // $FlowFixMe
  document.body,
  // $FlowFixMe
  document.querySelector('[data-application]')
);
