// @flow

import compression from 'compression';
import connect from 'connect';
import {join} from 'path';
import serve from 'serve-static';

import * as rest from '@server/api/adapters/rest';
import * as ssr from '@server/ssr';
import config from '@server/config';

export const server = connect();
export const root = join(__dirname, '..');

server.use('/', compression());
server.use('/', serve(join(root, 'public'), config.server.static.public));
server.use('/', serve(join(root, 'client'), config.server.static.client));
server.use('/api', rest.server);
server.use('/', ssr.server);
server.listen(config.server.port);
