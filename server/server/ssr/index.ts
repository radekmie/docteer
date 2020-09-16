import { FastifyInstance, RouteHandlerMethod } from 'fastify';

import { render } from './_render';

function makeSSRHandler(view: string): RouteHandlerMethod {
  return (request, reply) => {
    const { body, headers } = render(view);
    const code = request.headers['if-none-match'] === headers.etag ? 304 : 200;
    reply.code(code).headers(headers).send(body);
  };
}

export async function plugin(server: FastifyInstance) {
  server.get('/', makeSSRHandler(''));
  server.get('/login', makeSSRHandler('login'));
  server.get('/notes', makeSSRHandler(''));
  server.get('/notes/:noteId', makeSSRHandler(''));
  server.get('/settings', makeSSRHandler(''));
  server.get('/signup', makeSSRHandler('signup'));
}
