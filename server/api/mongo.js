// @flow

import MongoClient from 'mongodb';

import config from '../config';
import {cache} from '../../lib';

export const db = cache(async () => {
  for (let retries = config.mongo.retry.count; retries >= 0; --retries) {
    const clientPromise = MongoClient.connect(
      config.mongo.client.url,
      config.mongo.client.options
    );

    const client =
      retries === 0
        ? await clientPromise
        : await clientPromise.catch(() => null);

    if (client && client.isConnected()) return client.db();

    await new Promise(resolve => setTimeout(resolve, config.mongo.retry.delay));
  }

  throw new Error('Something happened!');
});
