// @flow

import {h} from 'preact';
import {render} from 'preact';

import {Application} from '/imports/components/Application';

render(h(Application), document.body, document.querySelector('.app'));
