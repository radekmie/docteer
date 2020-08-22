import get from 'lodash/get';
import isEqual from 'lodash/isEqual';
import { Collection, Db } from 'mongodb';

import { cache } from '../../shared';
import { getDb } from './_getDb';
import * as definitions from './definitions';

export type CollectionName = keyof CollectionDefinitions;
export type CollectionDefinition = CollectionDefinitions[CollectionName];
export type CollectionDefinitions = typeof definitions;

export const getCollections = cache(async () => {
  const db = await getDb();

  const collections: Record<CollectionName, Collection> = Object.create(null);
  for (const name of Object.keys(definitions) as CollectionName[]) {
    collections[name] = await createCollection(db, definitions[name]);
  }

  return collections;
});

async function createCollection(
  db: Db,
  { indexes, name, schema }: CollectionDefinition,
) {
  try {
    await db.createCollection(name);
  } catch (error) {
    // It's OK.
  }

  const collection = db.collection(name);

  // Update indexes.
  for (const index of indexes) {
    // @ts-expect-error Variable index definition length.
    await collection.createIndex(...index);
  }

  // Update schema.
  const definition = await db.command({ listCollections: 1, filter: { name } });
  const prevSchema = get(
    definition,
    'cursor.firstBatch.0.options.validator.$jsonSchema',
  );

  if (!isEqual(schema, prevSchema)) {
    await db.command({
      collMod: name,
      validationAction: 'error',
      validationLevel: 'strict',
      validator: { $jsonSchema: schema },
    });
  }

  return collection;
}
