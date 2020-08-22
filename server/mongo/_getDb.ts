import { cache } from '../../shared';
import { getMongo } from './';
export const getDb = cache(async () => {
  const mongo = await getMongo();
  return mongo.db();
});
