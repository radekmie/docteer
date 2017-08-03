import React    from 'react';
import ReactDOM from 'react-dom';
import Route    from 'react-router/Route';
import Router   from 'react-router/Router';
import Switch   from 'react-router/Switch';
import {root}   from 'baobab-react/higher-order';

import {Meteor} from 'meteor/meteor';

import Application from '/imports/components/Application';
import {history}   from '/imports/state';
import {tree}      from '/imports/state';

const RootedRouter = root(tree, Router);

ReactDOM.render((
    <RootedRouter history={history}>
        <Switch>
            <Route path="/" exact component={Application} />
            <Route path="/:proof" component={Application} />
        </Switch>
    </RootedRouter>
), document.getElementById('application'));

Meteor.call('randomData', (error, result) => tree.merge(result));
