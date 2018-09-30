// @flow

import {cache} from '@shared';

import {getDb} from '@server/mongo';

export const getCollections = cache(async () => {
  const db = await getDb();

  // prettier-ignore
  const collections = {
    Notes:        db.createCollection('notes'),
    NotesArchive: db.createCollection('notes-archive'),
    Users:        db.createCollection('users')
  };

  for (const [name, collection] of Object.entries(collections))
    collections[name] = await collection;

  await Promise.all([
    collections.Notes.createIndex({_id_user: 1, _id_slug: 1}, {unique: true}),
    collections.Notes.createIndex({_id_user: 1, _updated: 1}),
    collections.Notes.createIndex({_removed: 1})
  ]);

  return collections;
});
