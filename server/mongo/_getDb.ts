import { getMongo } from '.';
import { cache } from '../../shared';
export const getDb = cache(async () => {
  const mongo = await getMongo();
  return mongo.db();
});
