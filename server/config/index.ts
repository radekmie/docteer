import crypto from 'crypto';
import set from 'lodash/set';

export type Config = {
  jwt: { exp: number; secret: Buffer | string };
  mongo: {
    client: {
      options: {
        ignoreUndefined: boolean;
        retryReads: boolean;
        retryWrites: boolean;
        useNewUrlParser: boolean;
        useUnifiedTopology: boolean;
      };
      url: string;
    };
    retry: { count: number; delay: number };
  };
  node: { env: string };
  server: {
    host: string;
    port: number;
  };
};

const config: Record<string, unknown> = {
  'jwt.exp': 24 * 60 * 60,
  'jwt.secret': crypto.randomBytes(256),
  'mongo.client.options.ignoreUndefined': true,
  'mongo.client.options.retryReads': true,
  'mongo.client.options.retryWrites': true,
  'mongo.client.options.useNewUrlParser': true,
  'mongo.client.options.useUnifiedTopology': true,
  'mongo.client.url': 'mongodb://localhost:27017/docteer',
  'mongo.retry.count': 10,
  'mongo.retry.delay': 1000,
  'node.env': 'development',
  'server.host': '0.0.0.0',
  'server.port': 3000,
};

for (const key of Object.keys(config)) {
  const env = key.replace(/\./g, '_').toUpperCase();
  if (env in process.env) {
    try {
      config[key] = JSON.parse(process.env[env] ?? '');
    } catch (error) {
      config[key] = process.env[env];
    }
  }
}

// No random secret to make HMR work.
if (config['node.env'] === 'development') {
  config['jwt.secret'] = 'koń';
}

export default Object.entries(config).reduce(
  (a, b) => set(a, ...b),
  Object.create(null),
) as Config;
