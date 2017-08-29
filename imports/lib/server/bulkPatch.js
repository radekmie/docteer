export function bulkPatch (collection, patch, userId) {
  if (!patch.created.length && !patch.removed.length && !patch.updated.length) {
    return Promise.resolve();
  }

  const now = new Date();

  const hand = collection.rawCollection();
  const bulk = hand.initializeOrderedBulkOp();

  patch.removed.forEach(_id => bulk.find({_id_slug: _id, _id_user: userId}).updateOne({$set: {_removed: now, _updated: now}}));
  patch.updated.forEach(doc => {
    const _id      = doc._id;
    const _outline = doc._outline;

    if (patch.removed.includes(_id)) {
      return;
    }

    delete doc._id;
    delete doc._outline;

    const keys = Object.keys(doc);

    if (keys.length === 0) {
      return;
    }

    if (patch.created.includes(_id)) {
      bulk.insert({
        // ID
        _id_slug: _id,
        _id_user: userId,

        // Type
        _outline,

        // Dates
        _created: now,
        _removed: null,
        _updated: now,

        // History
        _version: [{_created: now, ...doc}],

        // Data
        ...doc
      });
    } else {
      // NOTE: Atomic update would be the best but there's an security issue.
      // bulk.find({_id_slug: _id, _id_user: userId}).updateOne({
      //     $set:  {_updated: now, ...doc},
      //     $push: {_version: {_created: now, ...doc}}
      // });

      bulk.find({_id_slug: _id, _id_user: userId}).updateOne({
        $set:             {_updated: now},
        $push: {_version: {_created: now}}
      });

      keys.forEach(key => {
        bulk.find({_id_slug: _id, _id_user: userId, [key]: {$exists: true}, '_version._created': now}).updateOne({
          $set: {[key]: doc[key], [`_version.$.${key}`]: doc[key]}
        });
      });
    }
  });

  return bulk.execute();
}
