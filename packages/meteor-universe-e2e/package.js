/* global Package:false Npm:false */

Package.describe({
    name: 'universe:e2e',
    version: '0.3.0',
    summary: 'Complete end-to-end/acceptance testing solution for Meteor: Mocha/Chai & Chrome Puppeteer',
    git: 'https://github.com/vazco/meteor-universe-e2e',
    documentation: 'README.md',
    testOnly: true
});

Npm.depends({
    mocha: '3.5.0',
    puppeteer: '0.11.0'
});

Package.onUse(api => {
    api.versionsFrom('1.6-beta.25');

    api.use('ecmascript');
    api.use('promise', 'server');

    api.mainModule('client.js', 'client');
    api.mainModule('server.js', 'server');
});
