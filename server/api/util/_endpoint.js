// @flow

import Ajv from 'ajv';
import jwt from 'jsonwebtoken';
import url from 'url';
import {ObjectId} from 'mongodb';

import * as users from '@server/api/services/users/lib';
import config from '@server/config';
import {APIError} from '@server/api/util';
import {server} from '@server/api/entry';

const ajv = new Ajv({allErrors: true});

export function endpoint<Params: {}, Result: {}, Schema: {}>(
  method: string,
  path: string,
  {
    authorize = true,
    handle,
    schema
  }: {|
    authorize?: boolean,
    handle: Params => Promise<Result>,
    schema: Schema
  |}
) {
  const validator = ajv.compile(schema);

  // eslint-disable-next-line complexity
  server.use(path, async (request, response, next) => {
    if (request.method !== method) {
      next();
      return;
    }

    try {
      if (request.method === 'GET') {
        try {
          request.body = url.parse(request.url, true).query;

          for (const [key, value] of Object.entries(request.body))
            if (isFinite(value) && '' + parseInt(value) === value)
              request.body[key] = parseInt(value);
        } catch (error) {
          throw new APIError({code: 'api-url'});
        }
      } else {
        try {
          request.body = JSON.parse(request.body);
        } catch (error) {
          throw new APIError({code: 'api-json'});
        }

        if (!request.body || request.body.constructor !== Object)
          throw new APIError({code: 'api-json-body'});
      }

      if (!validator(request.body))
        throw new APIError({code: 'api-validation', info: validator.errors});

      const context = {
        jwt: null,
        jwtDecoded: null,
        user: null,
        userId: null
      };

      const token = request.headers.authorization;
      if (token) {
        if (!token.startsWith('Bearer '))
          throw new APIError({code: 'api-invalid-token'});

        context.jwt = token.replace(/^Bearer (.*?)$/, '$1');

        try {
          context.jwtDecoded = jwt.verify(context.jwt, config.jwt.secret);
        } catch (error) {
          throw new APIError({code: 'api-failed-token'});
        }

        try {
          context.userId = new ObjectId(context.jwtDecoded.sub);
        } catch (error) {
          // NOTE: It might be an old user, with Meteor string id.
          context.userId = context.jwtDecoded.sub;
        }

        context.user = await users.byId({_id: context.userId});
        if (!context.user) throw new APIError({code: 'api-unknown-token'});
      }

      if (!authorize && context.user) throw new APIError({code: 'api-log-in'});
      if (authorize && !context.user) throw new APIError({code: 'api-log-out'});

      const result = await handle.call(context, request.body);

      response.writeHead(200, {'Content-Type': 'application/json'});
      response.end(JSON.stringify({error: null, result}));
    } catch (_error) {
      const error = APIError.fromError(_error);

      response.writeHead(error.http, {'Content-Type': 'application/json'});
      response.end(JSON.stringify({error: error.toJSON(), response: null}));
    }
  });
}
