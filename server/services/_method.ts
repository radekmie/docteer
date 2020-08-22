import { ajv } from '.';
import { APIContextType } from '../../types';
import { APIError } from '../api';

export function method<Params extends {}, Result>(
  handle: (params: Params, context: APIContextType) => Promise<Result>,
  schema: object,
) {
  const validator = ajv.compile(schema);

  return async (params: Params, context: APIContextType) => {
    if (!validator(params)) {
      throw new APIError({
        code: 'api-validation',
        info: { errors: validator.errors },
      });
    }

    return await handle(params, context);
  };
}
