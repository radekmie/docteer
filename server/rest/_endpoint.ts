import { ServerResponse } from 'http';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import url from 'url';

import { APIContextType } from '../../types';
import { APIError } from '../api';
import config from '../config';
import { withTransaction } from '../mongo';
import * as users from '../services/users';
import { server } from './';

export function endpoint<Params extends {}, Result extends {}>(
  http: string,
  path: string,
  method: (params: Params, context: APIContextType) => Promise<Result>,
  { authorize }: { authorize: boolean },
) {
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  server.use(path, async (request, response, next) => {
    if (request.method !== http) {
      next();
      return;
    }

    try {
      const data: Params =
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

        return await method(data, context);
      });

      _response(response, null, result);
    } catch (error) {
      _response(response, APIError.fromError(error), null);
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
    const result = url.parse(path, true).query as Record<string, unknown>;
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

function _response(
  response: ServerResponse,
  error: APIError | null,
  result: unknown,
) {
  const code = error ? error.http : 200;
  const body = { error: error ? error.toJSON() : null, result };

  response.writeHead(code, { 'Content-Type': 'application/json' });
  response.end(JSON.stringify(body));
}
