// @flow

import Ajv from 'ajv';
import jwt from 'jsonwebtoken';
import url from 'url';
import {ObjectId} from 'mongodb';

import * as users from '@server/api/services/users';
import APIError from '@server/api/APIError';
import config from '@server/config';
import {server} from '@server/api/adapters/rest';
import {withTransaction} from '@server/mongo';

import type {APIContextType} from '@types';

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
    handle: (Params, APIContextType) => Promise<Result>,
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
        request.body = _parseQuery(request.url);
      } else {
        request.body = _parseJSON(request.body);
      }

      if (!validator(request.body))
        throw new APIError({code: 'api-validation', info: validator.errors});

      // $FlowFixMe
      const result = await withTransaction(async transaction => {
        // $FlowFixMe
        const context: APIContextType = {
          ...transaction,
          jwt: null,
          jwtDecoded: null,
          user: null,
          userId: null
        };

        await _authorize(context, request.headers.authorization);

        if (!authorize && context.user)
          throw new APIError({code: 'api-log-out'});
        if (authorize && !context.user)
          throw new APIError({code: 'api-log-in'});

        return await handle(request.body, context);
      });

      _response(response, null, result);
    } catch (error) {
      _response(response, APIError.fromError(error), null);
    }
  });
}

async function _authorize(context, token: string) {
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

    context.user = await users.byId({_id: context.userId}, context);
    if (!context.user) throw new APIError({code: 'api-unknown-token'});
  }
}

function _parseJSON(text) {
  let result;
  try {
    result = JSON.parse(text);
  } catch (error) {
    throw new APIError({code: 'api-json'});
  }

  if (!result || result.constructor !== Object)
    throw new APIError({code: 'api-json-body'});

  return result;
}

function _parseQuery(path) {
  try {
    const result = url.parse(path, true).query || {};

    for (const [key, value] of Object.entries(result))
      if (isFinite(value) && '' + parseInt(value) === value)
        result[key] = parseInt(value);

    return result;
  } catch (error) {
    throw new APIError({code: 'api-url'});
  }
}

function _response(response, error, result) {
  const code = error ? error.http : 200;
  const body = {error: error ? error.toJSON() : null, result};

  response.writeHead(code, {'Content-Type': 'application/json'});
  response.end(JSON.stringify(body));
}
