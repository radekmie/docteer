// @flow

import connect from 'connect';

export const server = connect();

server.use('/', (request, response, next) => {
  const host = request.headers.host || '';

  if (host.startsWith('www.')) {
    response.writeHead(301, {
      location: `https://${host.slice(4)}${request.originalUrl}`
    });
    response.end();
  } else {
    next();
  }
});
