import express from 'express';
import { extname } from 'path';

import { params, render } from '.';

export const server = express.Router();

server.use((request, response, next) => {
  if (request.method !== 'GET' || extname(request.url)) {
    next();
    return;
  }

  const { body, headers } = render(params(request.url));
  const code = request.headers['if-none-match'] === headers.etag ? 304 : 200;
  response.status(code).set(headers).end(body);
});
