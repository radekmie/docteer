import compression from 'compression';
import express from 'express';
import { join } from 'path';
import serve from 'serve-static';

import config from './config';
import { server as rest } from './rest';
import { server as ssr } from './ssr';

export const server = express();

server.set('query parser', 'simple');
server.set('etag', false);
server.set('x-powered-by', false);
server.use(compression());
server.use('/api', rest);
server.use(serve(join(__dirname, '..', 'public'), config.server.static.public));
server.use(serve(join(__dirname, '..', 'client'), config.server.static.client));
server.use(ssr);
server.listen(config.server.port);
