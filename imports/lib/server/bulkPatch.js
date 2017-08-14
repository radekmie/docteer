export function bulkPatch (collection, patch, userId) {
    const udsC = patch.created;
    const udsR = patch.removed;
    const udsU = Object.keys(patch.updated);

    if (!udsC.length && !udsR.length && !udsU.length) {
        return Promise.resolve();
    }

    const hand = collection.rawCollection();
    const bulk = hand.initializeUnorderedBulkOp();

    udsR.forEach(_ud => bulk.find({_ud, userId}).removeOne());
    udsU.forEach(_ud => {
        if (!patch.removed[_ud]) {
            if (udsC.includes(_ud)) {
                bulk.insert(Object.assign({_ud, userId}, patch.updated[_ud]));
            } else {
                bulk.find({_ud, userId}).updateOne({$set: patch.updated[_ud]});
            }
        }
    });

    return bulk.execute();
}
