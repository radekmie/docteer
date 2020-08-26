import crypto from 'crypto';
import isPlainObject from 'lodash/isPlainObject';
import set from 'lodash/set';
import snakeCase from 'lodash/snakeCase';

const config = {
  jwt: { exp: 24 * 60 * 60, secret: crypto.randomBytes(256) },
  mongo: {
    client: {
      options: {
        ignoreUndefined: true,
        maxPoolSize: 100,
        useUnifiedTopology: true,
        validateOptions: true,
      },
      url: 'mongodb://localhost:27017/docteer',
    },
    retry: { count: 10, delay: 1000 },
  },
  node: { env: 'development' },
  server: {
    host: '0.0.0.0',
    port: 3000,
  },
};

function checkForEnvVars(object: object, path: string[]) {
  for (const [key, value] of Object.entries(object)) {
    path.push(key);

    if (isPlainObject(value)) {
      checkForEnvVars(value, path);
    } else {
      const envKey = snakeCase(path.join('_')).toUpperCase();
      const envValue = process.env[envKey];
      if (envValue) {
        try {
          set(config, path, JSON.parse(envValue));
        } catch (error) {
          set(config, path, envValue);
        }
      }
    }

    path.pop();
  }
}

checkForEnvVars(config, []);

// No random secret to make HMR work.
if (config.node.env === 'development') {
  config.jwt.secret = Buffer.from([0]);
}

export default config;
