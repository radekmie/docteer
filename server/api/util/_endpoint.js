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
        request.body = _parseQuery(request.url);
      } else {
        request.body = _parseJSON(request.body);
      }

      if (!validator(request.body))
        throw new APIError({code: 'api-validation', info: validator.errors});

      const context = await _authorize(request.headers.authorization);

      if (!authorize && context.user) throw new APIError({code: 'api-log-in'});
      if (authorize && !context.user) throw new APIError({code: 'api-log-out'});

      const result = await handle.call(context, request.body);

      _response(response, null, result);
    } catch (error) {
      _response(response, APIError.fromError(error), null);
    }
  });
}

async function _authorize(token) {
  const context = {
    jwt: null,
    jwtDecoded: null,
    user: null,
    userId: null
  };

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

  return context;
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
