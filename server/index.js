// @flow

import compression from 'compression';
import connect from 'connect';
import {join} from 'path';
import serve from 'serve-static';

import config from './config';
import {server as api} from './api/entry';
import {server as ssr} from './ssr/entry';
import {server as www} from './www/entry';

import './api/services/notes/api';
import './api/services/users/api';

export const server = connect();
export const root = join(__dirname, '..');

server.use('/', www);
server.use('/', compression());
server.use('/', serve(join(root, 'public'), config.server.static.public));
server.use('/', serve(join(root, 'client'), config.server.static.client));
server.use('/api', api);
server.use('/', ssr);
server.listen(config.server.port);
