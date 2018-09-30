// @flow

import {cache} from '@lib';

import {getMongo} from '@server/mongo';

export const getDb = cache(async () => {
  const mongo = await getMongo();
  return mongo.db();
});
