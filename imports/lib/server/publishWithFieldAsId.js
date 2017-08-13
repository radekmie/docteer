export function publishWithFieldAsId (context, field, cursor) {
    const collection = cursor._cursorDescription.collectionName;

    let map = Object.create(null);
    context.onStop(() => {
        map = Object.create(null);
    });

    cursor.observeChanges({
        added (_id, fields) {
            map[_id] = fields[field];
            delete     fields[field];

            context.added(collection, map[_id], fields);
        },

        changed (_id, fields) {
            context.changed(collection, map[_id], fields);
        },

        removed (_id) {
            context.removed(collection, map[_id]);

            delete map[_id];
        }
    });
}
