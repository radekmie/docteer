import { FastifyInstance } from 'fastify';

import { params, render } from './_render';

export async function plugin(server: FastifyInstance) {
  server.get('/*', async (request, reply) => {
    const { body, headers } = render(params(request.url));
    const code = request.headers['if-none-match'] === headers.etag ? 304 : 200;
    reply.code(code).headers(headers);
    return body;
  });
}
