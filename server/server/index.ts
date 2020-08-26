import fastify from 'fastify';
import compress from 'fastify-compress';

import config from '../config';
import { ajv } from '../lib';
import { plugin as assets } from './assets';
import { plugin as rest } from './rest';
import { plugin as ssr } from './ssr';

export async function start() {
  const server = await fastify();

  // Hide all errors.
  server.setErrorHandler((error, request, reply) => {
    reply.code(500).send();
  });

  // Custom 404?
  server.setNotFoundHandler((request, reply) => {
    reply.code(404).send();
  });

  // Use our ajv instance.
  server.setValidatorCompiler(({ schema }) => ajv.compile(schema));

  // Register all routes.
  await server.register(compress);
  await server.register(rest, { prefix: '/api' });
  await server.register(assets);
  await server.register(ssr);
  await server.listen(config.server.port);
}
