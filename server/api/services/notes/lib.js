// @flow

import type {APIContextType} from '@types';
import type {PatchType} from '@types';

export async function archive(input: {}, context: APIContextType) {
  const Notes = context.db.collection('notes');
  const archive = await Notes.find({_removed: {$ne: null}}).toArray();

  if (archive.length === 0) return;

  const $in = archive.map(note => note._id);

  const NotesArchive = context.db.collection('notes-archive');
  await NotesArchive.insertMany(archive);
  await Notes.deleteMany({_id: {$in}});
}

export async function getMine(
  {refresh}: {|refresh: number|},
  context: APIContextType
) {
  const diff: PatchType<*, *, *> = {created: [], removed: [], updated: []};
  if (refresh === Infinity) return diff;

  const after = new Date(refresh);
  const projection = {
    _id: 0,
    _id_user: 0,
    _updated: 0,
    _version: 0
  };

  const Notes = context.db.collection('notes');
  await Notes.find(
    {_id_user: context.userId, ...(after ? {_updated: {$gt: after}} : {})},
    {projection}
  ).forEach(({_id_slug: _id, _created, _removed, ...note}) => {
    if (_removed && _removed > after) diff.removed.push(_id);
    else {
      diff.updated.push({_id, ...note});

      if (_created > after) diff.created.push(_id);
    }
  });

  return diff;
}

export async function patchMine(
  {patch, refresh}: {|patch: PatchType<*, *, *>, refresh: number|},
  context: APIContextType
) {
  const now = new Date();
  const bulk = [];

  patch.removed.forEach(_id => {
    bulk.push({
      updateOne: {
        filter: {_id_slug: _id, _id_user: context.userId},
        update: {$set: {_removed: now, _updated: now}}
      }
    });
  });

  patch.updated.forEach(doc => {
    const _id = doc._id;
    const _outline = doc._outline;
    const _outname = doc._outname;

    if (patch.removed.includes(_id)) return;

    for (const key in doc) {
      if (key.slice(0, 1) === '_') delete doc[key];
    }

    if (Object.keys(doc).length === 0) return;

    if (patch.created.includes(_id)) {
      bulk.push({
        insertOne: {
          document: {
            // ID
            _id_slug: _id,
            _id_user: context.userId,

            // Type
            _outline,
            _outname,

            // Dates
            _created: now,
            _removed: null,
            _updated: now,

            // History
            _version: [{_created: now, _outline, _outname, ...doc}],

            // Data
            ...doc
          }
        }
      });
    } else {
      bulk.push({
        updateOne: {
          filter: {_id_slug: _id, _id_user: context.userId},
          update: {
            $set: {
              _updated: now,
              ...(_outline && {_outline}),
              ...(_outname && {_outname}),
              ...doc
            },
            $push: {
              _version: {
                _created: now,
                ...(_outline && {_outline}),
                ...(_outname && {_outname}),
                ...doc
              }
            }
          }
        }
      });
    }
  });

  if (bulk.length !== 0) {
    const Notes = context.db.collection('notes');
    await Notes.bulkWrite(bulk);
  }

  const result = await getMine({refresh}, context);

  if (patch.removed.length) await archive({}, context);

  return result;
}
