// @flow

import {WebApp} from 'meteor/webapp';

WebApp.rawConnectHandlers.stack.unshift({
  route: '',
  handle(req, res, next) {
    const host = req.headers.host || '';

    if (host.startsWith('www.')) {
      res.writeHead(301, {
        location: `https://${host.slice(4)}${req.originalUrl}`
      });
      res.end();
    } else {
      next();
    }
  }
});
