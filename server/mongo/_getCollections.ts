import isEqual from 'lodash/isEqual';
import { Db } from 'mongodb';

import { cache } from '../../shared';
import { Collections } from '../../types';
import { getDb } from './_getDb';
import * as definitions from './definitions';

export const getCollections = cache(async () => {
  const db = await getDb();
  const collections: Collections = {
    Notes: await createCollection(db, 'Notes'),
    Users: await createCollection(db, 'Users'),
  };

  return collections;
});

async function createCollection<Name extends keyof Collections>(
  db: Db,
  name: Name,
) {
  const { indexes, collectionName, schema } = definitions[name];
  const collection = db.collection(collectionName) as Collections[Name];

  // Update indexes.
  for (const [definition, options] of indexes) {
    await db.createIndex(collectionName, definition, options || {});
  }

  // Update schema.
  const definition = await db
    .listCollections({ name: collectionName }, { nameOnly: false })
    .next();

  const previousSchema = definition?.options?.validator?.$jsonSchema;
  if (!isEqual(schema, previousSchema)) {
    await db.command({
      collMod: collectionName,
      validationAction: 'error',
      validationLevel: 'strict',
      validator: { $jsonSchema: schema },
    });
  }

  return collection;
}
