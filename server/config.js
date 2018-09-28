// @flow

import crypto from 'crypto';
import set from 'lodash/set';

const config = {
  'jwt.exp': 24 * 60 * 60,
  'jwt.secret': crypto.randomBytes(256),
  'mongo.client.options.ignoreUndefined': true,
  'mongo.client.options.reconnectTries': Infinity,
  'mongo.client.options.useNewUrlParser': true,
  'mongo.client.url': 'mongodb://localhost:27017/docteer',
  'mongo.retry.count': 10,
  'mongo.retry.delay': 1000,
  'node.env': 'development',
  'server.port': 3000,
  'server.static.client.extensions.0': 'js',
  'server.static.client.extensions.1': 'map',
  'server.static.client.index': false,
  'server.static.public.index': false
};

for (const key of Object.keys(config)) {
  const env = key.replace(/\./g, '_').toUpperCase();

  if (env in process.env) {
    // $FlowFixMe
    config[key] = process.env[env];
  }
}

// $FlowFixMe
export default Object.entries(config).reduce((a, b) => set(a, ...b), {});
