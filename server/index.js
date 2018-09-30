// @flow

import compression from 'compression';
import connect from 'connect';
import {join} from 'path';
import serve from 'serve-static';

import config from '@server/config';
import {server as api} from '@server/api';
import {server as ssr} from '@server/ssr';
import {server as www} from '@server/www';

export const server = connect();
export const root = join(__dirname, '..');

server.use('/', www);
server.use('/', compression());
server.use('/', serve(join(root, 'public'), config.server.static.public));
server.use('/', serve(join(root, 'client'), config.server.static.client));
server.use('/api', api);
server.use('/', ssr);
server.listen(config.server.port);
