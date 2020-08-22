// @flow

import compression from 'compression';
import connect from 'connect';
import {join} from 'path';
import serve from 'serve-static';

import config from '@server/config';
import {server as rest} from '@server/rest';
import {server as ssr} from '@server/ssr';

export const server = connect();
export const root = join(__dirname, '..');

server.use('/', compression());
server.use('/', serve(join(root, 'public'), config.server.static.public));
server.use('/', serve(join(root, 'client'), config.server.static.client));
server.use('/api', rest);
server.use('/', ssr);
server.listen(config.server.port);
