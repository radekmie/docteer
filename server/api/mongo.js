// @flow

import MongoClient from 'mongodb';

import config from '@server/config';
import {cache} from '@lib';

import type {APITransactionType} from '@types';

export const getCollections = cache(async () => {
  const db = await getDb();

  // prettier-ignore
  const collections = {
    Notes:        db.createCollection('notes'),
    NotesArchive: db.createCollection('notes-archive'),
    Users:        db.createCollection('users')
  };

  for (const [name, collection] of Object.entries(collections))
    collections[name] = await collection;

  await Promise.all([
    collections.Notes.createIndex({_id_user: 1, _id_slug: 1}, {unique: true}),
    collections.Notes.createIndex({_id_user: 1, _updated: 1}),
    collections.Notes.createIndex({_removed: 1})
  ]);

  return collections;
});

export const getMongo = cache(async () => {
  for (let retries = config.mongo.retry.count; retries >= 0; --retries) {
    const clientPromise = MongoClient.connect(
      config.mongo.client.url,
      config.mongo.client.options
    );

    const client =
      retries === 0
        ? await clientPromise
        : await clientPromise.catch(() => null);

    if (client && client.isConnected()) return client;

    await new Promise(resolve => setTimeout(resolve, config.mongo.retry.delay));
  }

  throw new Error('Something happened!');
});

export const getDb = cache(async () => {
  const mongo = await getMongo();
  return mongo.db();
});

export async function withTransaction<Result>(
  fn: APITransactionType => Result
): Promise<Result> {
  const [collections, db, mongo] = await Promise.all([
    getCollections(),
    getDb(),
    getMongo()
  ]);

  const session = await mongo.startSession();
  await session.startTransaction({readConcern: {level: 'snapshot'}});

  try {
    const result = await fn({collections, db, mongo, session});
    await session.commitTransaction();

    return result;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
}
