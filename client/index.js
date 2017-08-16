import {Component, h, render} from 'preact';

import {Application} from '/imports/components/Application';

if (process.env.NODE_ENV === 'development') {
    require('preact/devtools');
}

function shallow (a, b) {
    for (const key in a) {
        if (a[key] !== b[key]) {
            return true;
        }
    }

    for (const key in b) {
        if (!(key in b)) {
            return true;
        }
    }

    return false;
}

Component.prototype.shouldComponentUpdate = function shouldComponentUpdate (props, state) {
    return shallow(props, this.props) || shallow(state, this.state);
};

render(h(Application), document.body, document.querySelector('.app'));
