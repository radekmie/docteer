// @flow

import {cache} from '@shared';
import {getMongo} from '@server/mongo';

export const getDb = cache<void, _>(async () => {
  const mongo = await getMongo();
  return mongo.db();
});
