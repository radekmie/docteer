// @flow

import {getCollections, getDb, getMongo} from '@server/mongo';

import type {APITransactionType} from '@types';

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
