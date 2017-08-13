export function bulkPatch (collection, patch, userId) {
    const idsC = patch.created;
    const idsR = patch.removed;
    const idsU = Object.keys(patch.updated);

    if (!idsC.length && !idsR.length && !idsU.length)
        return;

    const hand = collection.rawCollection();
    const bulk = hand.initializeUnorderedBulkOp();

    idsR.forEach(_id => bulk.find({_id}).remove());
    idsU.forEach(_id => {
        if (!patch.removed[_id]) {
            if (idsC.includes(_id)) {
                bulk.insert(Object.assign({_id, userId}, patch.updated[_id]));
            } else {
                bulk.find({_id}).update({$set: patch.updated[_id]});
            }
        }
    });

    bulk.execute();
}
