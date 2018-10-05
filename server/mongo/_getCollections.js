// @flow

import get from 'lodash/get';
import isEqual from 'lodash/isEqual';

import * as definitions from '@server/mongo/definitions';
import {cache} from '@shared';
import {getDb} from '@server/mongo';

export const getCollections = cache(async () => {
  const db = await getDb();

  const collections = {};
  for (const name of Object.keys(definitions))
    collections[name] = await createCollection(db, definitions[name]);

  return collections;
});

async function createCollection(db, {indexes, name, schema}) {
  const collection = await db.createCollection(name);

  // Update indexes.
  for (const index of indexes) {
    await collection.createIndex(...index);
  }

  // Update schema.
  const definition = await db.command({listCollections: 1, filter: {name}});
  const prevSchema = get(
    definition,
    'cursor.firstBatch.0.options.validator.$jsonSchema'
  );

  if (!isEqual(schema, prevSchema)) {
    await db.command({
      collMod: name,
      validationAction: 'error',
      validationLevel: 'strict',
      validator: {$jsonSchema: schema}
    });
  }

  return collection;
}
