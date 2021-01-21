import Ajv from 'ajv';
import ajvFormats from 'ajv-formats';
import ajvKeywords from 'ajv-keywords';
import ajvKeywordsInstanceOf from 'ajv-keywords/dist/definitions/instanceof';
import { ObjectId } from 'mongodb';

export const ajv = new Ajv({
  allErrors: true,
  allowUnionTypes: true,
  coerceTypes: true,
  removeAdditional: true,
  useDefaults: true,
});

ajvFormats(ajv);
ajvKeywords(ajv);

Object.assign(ajvKeywordsInstanceOf.CONSTRUCTORS, { ObjectId });
