import { HTTPMethods, RouteOptions } from 'fastify';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';

import { APIContextType, APIEndpoints } from '../../../types';
import * as api from '../../api';
import config from '../../config';
import { APIError } from '../../lib';
import { withTransaction } from '../../mongo';

export function endpoint<Endpoint extends keyof APIEndpoints>(
  endpoint: Endpoint,
  fn: APIEndpoints[Endpoint],
  { authorize }: { authorize: boolean },
): RouteOptions {
  const [method, url] = endpoint.split(' ');

  return {
    method: method as HTTPMethods,
    schema: { [method === 'GET' ? 'querystring' : 'body']: fn.schema },
    url,
    handler: request =>
      withTransaction(async transaction => {
        const context: APIContextType = {
          ...transaction,
          // @ts-expect-error These are filled in `_authorize`.
          jwt: null,
          // @ts-expect-error These are filled in `_authorize`.
          jwtDecoded: null,
          // @ts-expect-error These are filled in `_authorize`.
          user: null,
          // @ts-expect-error These are filled in `_authorize`.
          userId: null,
        };

        await _authorize(context, request.headers.authorization);

        if (!authorize && context.user) {
          throw new APIError({ code: 'api-log-out' });
        }
        if (authorize && !context.user) {
          throw new APIError({ code: 'api-log-in' });
        }

        const data = method === 'GET' ? request.query : request.body;
        return await fn.run(data as any, context);
      }),
  };
}

async function _authorize(context: APIContextType, token?: string) {
  if (token) {
    if (!token.startsWith('Bearer ')) {
      throw new APIError({ code: 'api-invalid-token' });
    }

    context.jwt = token.replace('Bearer ', '');

    try {
      // @ts-expect-error `jwt.verify` returns `string | object`;
      context.jwtDecoded = jwt.verify(context.jwt, config.jwt.secret, {
        algorithms: ['HS256'],
        clockTimestamp: +context.now / 1000,
      });
    } catch (error) {
      throw new APIError({ code: 'api-failed-token' });
    }

    // NOTE: It might be an old user, with Meteor string id.
    context.userId = ObjectId.isValid(context.jwtDecoded.sub)
      ? new ObjectId(context.jwtDecoded.sub)
      : context.jwtDecoded.sub;

    // @ts-expect-error This is checked later.
    context.user = await api.users.byId.run({ _id: context.userId }, context);
    if (!context.user) {
      throw new APIError({ code: 'api-unknown-token' });
    }
  }
}
