import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import url from 'url';

import { server } from '.';
import { APIContextType, APIEndpoints } from '../../types';
import { APIError } from '../api';
import config from '../config';
import { withTransaction } from '../mongo';
import * as users from '../services/users';

export function endpoint<Endpoint extends keyof APIEndpoints>(
  endpoint: Endpoint,
  fn: APIEndpoints[Endpoint],
  { authorize }: { authorize: boolean },
) {
  const [method, path] = endpoint.split(' ');

  server.use(path, async (request, response, next) => {
    if (request.method !== method) {
      next();
      return;
    }

    try {
      const data =
        request.method === 'GET'
          ? _parseQuery(request.url)
          : _parseJSON(request.body);

      const result = await withTransaction(async transaction => {
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

        return await fn(data, context);
      });

      response.status(200).json({ error: null, result });
    } catch (error) {
      response.status(error.http).json({ error: error.toJSON(), result: null });
    }
  });
}

async function _authorize(context: APIContextType, token?: string) {
  if (token) {
    if (!token.startsWith('Bearer ')) {
      throw new APIError({ code: 'api-invalid-token' });
    }

    context.jwt = token.replace(/^Bearer (.*?)$/, '$1');

    try {
      // @ts-expect-error `jwt.verify` returns `string | object`;
      context.jwtDecoded = jwt.verify(context.jwt, config.jwt.secret);
    } catch (error) {
      throw new APIError({ code: 'api-failed-token' });
    }

    try {
      context.userId = new ObjectId(context.jwtDecoded.sub);
    } catch (error) {
      // NOTE: It might be an old user, with Meteor string id.
      context.userId = context.jwtDecoded.sub;
    }

    // @ts-expect-error This is checked later.
    context.user = await users.byId({ _id: context.userId }, context);
    if (!context.user) {
      throw new APIError({ code: 'api-unknown-token' });
    }
  }
}

function _parseJSON(text: string) {
  let result;
  try {
    result = JSON.parse(text);
  } catch (error) {
    throw new APIError({ code: 'api-json' });
  }

  if (!result || result.constructor !== Object) {
    throw new APIError({ code: 'api-json-body' });
  }

  return result;
}

function _parseQuery(path: string) {
  try {
    const result = url.parse(path, true).query as any;
    for (const [key, value] of Object.entries(result)) {
      const valueInt = parseInt(value as string);
      if (isFinite(valueInt) && '' + valueInt === value) {
        result[key] = valueInt;
      }
    }

    return result;
  } catch (error) {
    throw new APIError({ code: 'api-url' });
  }
}
