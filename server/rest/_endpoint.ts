import jwt from 'jsonwebtoken';
import mapValues from 'lodash/mapValues';
import { ObjectId } from 'mongodb';
import { ParsedQs } from 'qs';

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
          ? _parseQuery(request.query)
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
    } catch (rawError) {
      const error = APIError.fromError(rawError);
      response.status(error.http).json({ error: error.toJSON(), result: null });
    }
  });
}

async function _authorize(context: APIContextType, token?: string) {
  if (token) {
    if (!token.startsWith('Bearer ')) {
      throw new APIError({ code: 'api-invalid-token' });
    }

    context.jwt = token.replace('Bearer ', '');

    try {
      // @ts-expect-error `jwt.verify` returns `string | object`;
      context.jwtDecoded = jwt.verify(context.jwt, config.jwt.secret);
    } catch (error) {
      throw new APIError({ code: 'api-failed-token' });
    }

    // NOTE: It might be an old user, with Meteor string id.
    context.userId = ObjectId.isValid(context.jwtDecoded.sub)
      ? new ObjectId(context.jwtDecoded.sub)
      : context.jwtDecoded.sub;

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

function _parseQuery(query: ParsedQs) {
  return mapValues(query as Record<string, string>, value =>
    isFinite(+value) && `${+value}` === value ? +value : value,
  );
}
