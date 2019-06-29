// @flow

import Ajv from 'ajv';
import ajvKeywords from 'ajv-keywords';
import {ObjectId} from 'mongodb';

export const ajv = new Ajv({allErrors: true});

ajvKeywords(ajv, ['instanceof']);
ajvKeywords.get('instanceof').definition.CONSTRUCTORS.ObjectId = ObjectId;
