import Ajv from 'ajv';
import ajvKeywords from 'ajv-keywords';
import { ObjectId } from 'mongodb';

export const ajv = new Ajv({ allErrors: true });

ajvKeywords(ajv, ['instanceof']);
// @ts-expect-error `ajv-keywords` has not types for `.get`.
ajvKeywords.get('instanceof').definition.CONSTRUCTORS.ObjectId = ObjectId;
