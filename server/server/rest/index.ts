import { FastifyInstance } from 'fastify';

import { APIError } from '../../lib';
import { endpoints } from './_endpoints';

export async function plugin(server: FastifyInstance) {
  // API errors are normal.
  server.setErrorHandler((rawError, request, reply) => {
    const error = APIError.fromError(rawError);
    reply.code(200).send({ error, result: null });
  });

  for (const endpoint of endpoints) {
    server.route(endpoint);
  }
}
