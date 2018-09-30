// @flow

import MongoClient from 'mongodb';

import config from '@server/config';
import {cache} from '@shared';

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
