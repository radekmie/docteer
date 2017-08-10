import React    from 'react';
import ReactDOM from 'react-dom';
import Route    from 'react-router/Route';
import Router   from 'react-router/Router';
import {root}   from 'baobab-react/higher-order';

import Application from '/imports/components/Application';
import {central}   from '/imports/state';
import {history}   from '/imports/state';

const RootedRouter = root(central, Router);

ReactDOM.render((
    <RootedRouter history={history}>
        <Route path="/:proof?" component={Application} />
    </RootedRouter>
), document.getElementById('application'));
