import {Component, h, render} from 'preact';

import {Application} from '/imports/components/Application';

if (process.env.NODE_ENV === 'development') {
    require('preact/devtools');
}

Component.prototype.shouldComponentUpdate = function shouldComponentUpdate (props) {
    for (const key in props) {
        if (this.props[key] !== props[key]) {
            return true;
        }
    }

    for (const key in props) {
        if (!(key in props)) {
            return true;
        }
    }

    return false;
};

render(h(Application), document.body, document.querySelector('#app'));
