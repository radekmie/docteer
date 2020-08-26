import { FastifyInstance } from 'fastify';
import serve from 'fastify-static';
import { join } from 'path';

export async function plugin(server: FastifyInstance) {
  for (const path of ['public', 'client']) {
    await server.register(serve, {
      decorateReply: false,
      root: join(__dirname, '..', path),
      wildcard: false,
    });
  }
}
