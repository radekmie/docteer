import BrowserRouter from 'react-router-dom/BrowserRouter';
import React         from 'react';
import ReactDOM      from 'react-dom';
import Route         from 'react-router/Route';
import Switch        from 'react-router/Switch';

import {Meteor} from 'meteor/meteor';

import Application from '/imports/components/Application';

Meteor.call('randomData', (error, result) => {
    ReactDOM.render((
        <BrowserRouter>
            <Switch>
                <Route path="/" exact    component={props => <Application {...props} {...result} />} />
                <Route path="/:testcase" component={props => <Application {...props} {...result} />} />
            </Switch>
        </BrowserRouter>
    ), document.getElementById('application'));
});

