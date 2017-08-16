import {h, render} from 'preact';

import {Application} from '/imports/components/Application';

if (process.env.NODE_ENV === 'development') {
    require('preact/devtools');
}

render(h(Application), document.querySelector('#app'));
