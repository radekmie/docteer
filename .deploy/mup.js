module.exports = {
    servers: {
        one: {
            host: '46.101.200.204',
            username: 'root'
        }
    },

    app: {
        name: 'docteer',
        path: '..',

        servers: {
            one: {}
        },

        buildOptions: {
            serverOnly: true
        },

        env: {
            MONGO_URL: 'mongodb://localhost/meteor',
            ROOT_URL: 'http://46.101.200.204'
        },

        docker: {
            image: 'abernix/meteord:node-8.3.0-base',
            imagePort: 80
        },

        deployCheckPort: 80,
        deployCheckWaitTime: 60,

        enableUploadProgressBar: true
    },

    mongo: {
        version: '3.4.1',
        servers: {
            one: {}
        }
    }
};
