// @flow

import SimpleSchema from 'simpl-schema';
import jwt from 'jsonwebtoken';
import url from 'url';
import {ObjectId} from 'mongodb';

import * as users from '../services/users/lib';
import {APIError} from './APIError';
import {server} from '../entry';

export function endpoint<Schema: {}>(
  name: string,
  {
    authorize = true,
    handle,
    schema
  }: {|
    authorize?: boolean,
    handle: Schema => *,
    schema: $ObjMap<Schema, () => mixed>
  |}
) {
  const [method, path] = name.split(' ', 2);
  const validator = new SimpleSchema(schema);

  // eslint-disable-next-line complexity
  server.use(path.slice(4), async (request, response, next) => {
    if (request.method !== method) {
      next();
      return;
    }

    try {
      if (request.method === 'GET') {
        try {
          request.body = url.parse(request.url, true).query;
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

      validator.clean(request.body, {mutate: true});
      validator.validate(request.body);

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
          context.jwtDecoded = jwt.verify(context.jwt, 'SECRET');
        } catch (error) {
          throw new APIError({code: 'api-failed-token'});
        }

        context.userId = new ObjectId(context.jwtDecoded.sub);
        context.user = await users.byId({_id: context.userId});
        if (!context.user) throw new APIError({code: 'api-unknown-token'});
      }

      if (!authorize && context.user) throw new APIError({code: 'api-log-in'});
      if (authorize && !context.user) throw new APIError({code: 'api-log-out'});

      const result = await handle.call(context, request.body);
      if (!result || result.constructor !== Object)
        throw new APIError({code: 'api-internal'});

      response.writeHead(200, {'Content-Type': 'application/json'});
      response.end(JSON.stringify(result));
    } catch (_error) {
      const error = APIError.fromError(_error);

      response.writeHead(error.http, {'Content-Type': 'application/json'});
      response.end(JSON.stringify(error.toJSON()));
    }
  });
}
