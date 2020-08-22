// @flow

import {APIError} from '@server/api';
import {ajv} from '@server/services';

import type {APIContextType} from '@types';

export function method<Params: {}, Result, Schema: {}>(
  handle: (Params, APIContextType) => Promise<Result>,
  schema: Schema
): (Params, APIContextType) => Promise<Result> {
  const validator = ajv.compile(schema);

  return async (data, context) => {
    if (!validator(data))
      throw new APIError({code: 'api-validation', info: validator.errors});

    return await handle(data, context);
  };
}
