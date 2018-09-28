// @flow

import MongoClient from 'mongodb';

import config from '@server/config';
import {cache} from '@lib';

export const client = cache(async () => {
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

export const db = cache(async () => {
  const mongo = await client();
  const db = mongo.db();

  const Notes = db.collection('notes');
  await Notes.createIndex({_id_user: 1, _id_slug: 1}, {unique: true});
  await Notes.createIndex({_id_user: 1, _updated: 1});
  await Notes.createIndex({_removed: 1});

  return db;
});
