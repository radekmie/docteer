// @flow

import {h} from 'preact';
import {render} from 'preact';

import {Application} from '@client/components/Application';

render(
  h(Application),
  // $FlowFixMe
  document.body,
  document.querySelector('[data-application]') || undefined
);
