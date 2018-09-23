// @flow

import connect from 'connect';
import {extname} from 'path';

import {params} from './render';
import {render} from './render';

export const server = connect();

server.use('/', (request, response, next) => {
  if (request.method !== 'GET' || extname(request.url)) {
    next();
    return;
  }

  const {body, headers} = render(params(request.url));

  if (request.headers['if-none-match'] === headers.etag)
    response.statusCode = 304;

  response.writeHead(response.statusCode, headers);
  response.end(body);
});
