// @flow

import type {APIContextType} from '@types';
import type {PatchType} from '@types';

export async function archive(input: {}, context: APIContextType) {
  const {Notes, NotesArchive} = context.collections;
  const archive = await Notes.find(
    {_removed: {$ne: null}},
    {session: context.session}
  ).toArray();

  if (archive.length === 0) return;

  const $in = archive.map(note => note._id);

  await Promise.all([
    Notes.deleteMany({_id: {$in}}, {session: context.session}),
    NotesArchive.insertMany(archive, {session: context.session})
  ]);
}

export async function getMine(
  {refresh}: {|refresh: number|},
  context: APIContextType
) {
  const diff: PatchType<> = {created: [], removed: [], updated: []};
  if (refresh === Infinity) return diff;

  const after = new Date(refresh - 5 * 60 * 1000);
  const projection = {
    _id: 0,
    _id_user: 0,
    _updated: 0,
    _version: 0
  };

  const {Notes} = context.collections;
  await Notes.find(
    {_id_user: context.userId, ...(after ? {_updated: {$gt: after}} : {})},
    {projection, session: context.session}
  ).forEach(note => {
    if (note._removed && note._removed > after) {
      diff.removed.push(note._id_slug);
    } else {
      diff.updated.push({
        _id: note._id_slug,
        _outname: note._outname,
        _outline: note._outline,
        ...note._objects
      });

      if (note._created > after) diff.created.push(note._id_slug);
    }
  });

  return diff;
}

export async function patchMine(
  {patch, refresh}: {|patch: PatchType<>, refresh: number|},
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

            // Dates
            _created: now,
            _removed: null,
            _updated: now,

            // Data
            _objects: doc,

            // Type
            _outname,
            _outline,

            // History
            _version: [{_updated: now, _objects: doc, _outname, _outline}]
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
              ...(_outname ? {_outname} : {}),
              ...(_outline ? {_outline} : {}),
              ...Object.entries(doc).reduce(
                (doc, [key, value]) =>
                  Object.assign(doc, {[`_objects.${key}`]: value}),
                {}
              )
            },
            $push: {
              _version: {
                _updated: now,
                _objects: doc,
                ...(_outname ? {_outname} : {}),
                ...(_outline ? {_outline} : {})
              }
            }
          }
        }
      });
    }
  });

  if (bulk.length !== 0) {
    const {Notes} = context.collections;
    await Notes.bulkWrite(bulk, {session: context.session});
  }

  const result = await getMine({refresh}, context);

  if (patch.removed.length) await archive({}, context);

  return result;
}
