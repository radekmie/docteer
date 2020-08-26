import { cache } from '../../shared';
import { getMongo } from './_getMongo';
export const getDb = cache(async () => {
  const mongo = await getMongo();
  return mongo.db();
});
