// @flow

import {WebApp} from 'meteor/webapp';

WebApp.rawConnectHandlers.stack.unshift({
  route: '',
  handle(req, res, next) {
    const host = req.headers.host || '';

    if (host.startsWith('www.')) {
      res.setHeader(
        'location',
        `${req.protocol}://${host.slice(4)}${req.originalUrl}`
      );
    } else {
      next();
    }
  }
});
