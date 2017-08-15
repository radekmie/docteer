export function bulkPatch (collection, patch, userId) {
    if (!patch.created.length && !patch.removed.length && !patch.updated.length) {
        return Promise.resolve();
    }

    const now = new Date();

    const hand = collection.rawCollection();
    const bulk = hand.initializeUnorderedBulkOp();

    patch.removed.forEach(_id => bulk.find({_id_slug: _id, _user_id: userId}).updateOne({$set: {_removed: now}}));
    patch.updated.forEach(doc => {
        const _id = doc._id;

        if (patch.removed.includes(_id)) {
            return;
        }

        delete doc._id;

        if (patch.created.includes(_id)) {
            bulk.insert({
                _id_slug: _id,
                _created: now,
                _removed: null,
                _updated: now,
                _user_id: userId,
                _versions: [{_created: now, ...doc}],
                ...doc
            });
        } else {
            bulk.find({_id_slug: _id, _user_id: userId}).updateOne({
                $set:  {_updated: now, ...doc},
                $push: {_versions: {_created: now, ...doc}}
            });
        }
    });

    return bulk.execute();
}
