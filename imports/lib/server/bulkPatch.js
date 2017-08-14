export function bulkPatch (collection, patch, userId) {
    const idsC = patch.created;
    const idsR = patch.removed;
    const docs = patch.updated;

    if (!idsC.length && !idsR.length && !docs.length) {
        return Promise.resolve();
    }

    const hand = collection.rawCollection();
    const bulk = hand.initializeUnorderedBulkOp();

    idsR.forEach(_ud => bulk.find({_ud, userId}).removeOne());
    docs.forEach(({_id: _ud, ...doc}) => {
        if (!patch.removed.includes(_ud)) {
            if (idsC.includes(_ud)) {
                bulk.insert(Object.assign({_ud, userId}, doc));
            } else {
                bulk.find({_ud, userId}).updateOne({$set: doc});
            }
        }
    });

    return bulk.execute();
}
