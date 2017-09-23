// @flow

import Ajv                   from 'ajv';
import bunyan                from 'bunyan';
import restify               from 'restify';
import {HttpError}           from 'restify-errors';
import {InternalServerError} from 'restify-errors';

import {Accounts} from 'meteor/accounts-base';
import {Meteor}   from 'meteor/meteor';
import {WebApp}   from 'meteor/webapp';

import {Notes} from '/imports/api/notes/server';
import {Stats} from '/imports/api/stats/server';

const ajv = new Ajv({coerceTypes: true});
const log = bunyan.createLogger({
  name: 'docteer.com',
  streams: [{stream: {write: row => Stats.rawCollection().insert(row)}, type: 'raw'}],
  serializers: {
    error: bunyan.stdSerializers.err,
    req:   bunyan.stdSerializers.req,
    res:   bunyan.stdSerializers.res
  }
});

const server = restify.createServer({name: 'docteer.com', version: '1.0.0'});

server.use(restify.plugins.acceptParser(['application/json']));
server.use(restify.plugins.authorizationParser());
server.use(restify.plugins.bodyParser());
server.use(restify.plugins.dateParser());
server.use(restify.plugins.gzipResponse());
server.use(restify.plugins.queryParser());

server.on('after', restify.plugins.metrics({server}, (error, metrics, req, res) => {
  if (error) {
    log.error({error, req, res, metrics});
  } else {
    log.info({req, res, metrics});
  }
}));

['del', 'get', 'head', 'opts', 'patch', 'post', 'put'].forEach(method => {
  const sync = server[method];
  server[method] = function wrapper (opts, handler) {
    sync.call(this, opts, (req, res, next) => {
      handler(req, res, next).catch(error => {
        next(error instanceof HttpError ? error : new InternalServerError(error));
      });
    });
  };
});

const context = {
  ajv,
  authenticate ({basic: {password, username}}) {
    return !!Meteor.users.findOne({
      _id: username,
      'services.resume.loginTokens': {
        $elemMatch: {
          hashedToken: Accounts._hashLoginToken(password),
          when: {$gte: new Date(Date.now() - 24 * 60 * 60 * 1000)}
        }
      }
    });
  }
};

[Notes].forEach(module => {
  module.register(server, context);
});

WebApp.rawConnectHandlers.use('/api', server.server);
