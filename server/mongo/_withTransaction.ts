import { APITransactionType } from '../../types';
import { getCollections } from './_getCollections';
import { getDb } from './_getDb';
import { getMongo } from './_getMongo';

export async function withTransaction<Result>(
  fn: (transaction: APITransactionType) => Result | Promise<Result>,
): Promise<Result> {
  const [collections, db, mongo] = await Promise.all([
    getCollections(),
    getDb(),
    getMongo(),
  ]);

  const session = mongo.startSession();
  session.startTransaction({ readConcern: { level: 'snapshot' } });

  try {
    const result = await fn({ collections, db, mongo, session });
    await session.commitTransaction();

    return result;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}
