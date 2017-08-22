import {h, render} from 'preact';

import '/imports/state/triggers';

import {Application} from '/imports/components/Application';

if (process.env.NODE_ENV === 'development') {
    require('preact/devtools');
}

render(h(Application), document.body, document.querySelector('.app'));
