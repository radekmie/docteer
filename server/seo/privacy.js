// @flow

import {WebApp} from 'meteor/webapp';

WebApp.rawConnectHandlers.stack.unshift({
  route: '',
  handle(req, res, next: () => void) {
    res.setHeader('x-content-type-options', 'nosniff');
    next();
  }
});
