/** @jsx h */

import {Router}    from 'preact-router';
import {h, render} from 'preact';

import Application        from '/imports/components/Application';
import {central, history} from '/imports/state';

if (process.env.NODE_ENV === 'development')
    require('preact/devtools');

class RootedRouter extends Router {
    getChildContext () {
        return {tree: central};
    }
}

render((
    <RootedRouter history={history}>
        <Application path="/:proof?" />
    </RootedRouter>
), document.getElementById('application'));
