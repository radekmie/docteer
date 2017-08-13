import {h, render} from 'preact';

import {Application} from '/imports/components/Application';
import {tree}        from '/imports/state';

if (process.env.NODE_ENV === 'development')
    require('preact/devtools');

render(h(Application, {tree}), document.querySelector('#app'));
