import { APIContextType } from '../../types';
import { APIError } from './_APIError';
import { ajv } from './_ajv';

export function method<Params extends {}, Result>(
  run: (params: Params, context: APIContextType) => Promise<Result>,
  schema: object,
) {
  const validator = ajv.compile(schema);
  async function runSafe(params: Params, context: APIContextType) {
    if (!validator(params)) {
      throw new APIError({
        code: 'api-validation',
        info: { errors: validator.errors },
      });
    }

    return await run(params, context);
  }

  return { run, runSafe, schema, validator };
}
