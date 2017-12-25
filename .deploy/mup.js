// @flow

module.exports = {
  app: {
    name: 'docteer',
    path: '..',

    servers: {
      first: {}
    },

    buildOptions: {
      serverOnly: true
    },

    env: {
      MONGO_OPLOG_URL: 'mongodb://mongodb:27017/local',
      MONGO_URL: 'mongodb://mongodb:27017/docteer',
      ROOT_URL: 'https://docteer.com'
    },

    docker: {
      image: 'abernix/meteord:node-8.9.1-base',
      imagePort: 80
    },

    deployCheckPort: 80,
    deployCheckWaitTime: 60,

    enableUploadProgressBar: true
  },

  mongo: {
    version: '3.4.9',
    servers: {
      first: {}
    }
  },

  plugins: ['mup-disk'],

  proxy: {
    domains: 'docteer.com,www.docteer.com',

    ssl: {
      forceSSL: true,
      letsEncryptEmail: 'radekmie@gmail.com'
    }
  },

  servers: {
    first: {
      host: '46.101.200.204',
      username: 'root'
    }
  }
};
