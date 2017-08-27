import Baobab    from 'baobab';
import fuzzysort from 'fuzzysort';

export const tree = new Baobab({
    // Data
    docsOrigins: [],
    docsCreated: Object.create(null),
    docsRemoved: Object.create(null),
    docsUpdated: Object.create(null),

    docs: Baobab.monkey(
        ['docsOrigins'],
        ['docsCreated'],
        ['docsRemoved'],
        ['docsUpdated'],
        (origins, created, removed, updated) =>
            origins
                .concat(Object.keys(created).map(_id => ({_created: true, _id})))
                .map(x => Object.assign({_removed: !!removed[x._id], _updated: !!updated[x._id]}, x, updated[x._id]))
                .sort((a, b) => a.name.localeCompare(b.name))
    ),

    docsVisible: Baobab.monkey(
        ['docs'],
        ['docId'],
        ['filter'],
        ['search'],
        (docs, docId, filter, search) => {
            if (filter.length) {
                docs = docs.filter(doc => filter.every(filter => doc.labels.some(label => label === filter)));
            }

            if (search.trim()) {
                docs = docs.map(doc => ({doc, lower: doc.name.toLowerCase(), target: doc.name}));
                docs = fuzzysort.go(search.trim(), docs).slice(0, 50);
                docs = docs.map(result => Object.assign({}, result.doc, {name: result.highlighted}));
            }

            return docs.map(doc => Object.assign({_active: doc._id === docId, _href: stateToHref('d', doc._id !== docId && doc._id, filter, search)}, doc));
        }
    ),

    docId: undefined,
    doc: Baobab.monkey(
        ['docs'],
        ['docId'],
        (docs, docId) =>
            docs.find(doc => doc._id === docId)
    ),

    labels: Baobab.monkey(
        ['docs'],
        ['docsVisible'],
        ['docId'],
        ['filter'],
        ['search'],
        (docs, docsVisible, docId, filter, search) =>
            docs
                .reduce((labels, doc) => {
                    doc.labels.forEach(label => {
                        if (label && !labels.includes(label)) {
                            labels.push(label);
                        }
                    });

                    return labels;
                }, [])
                .sort()
                .map(name => {
                    const active = filter.includes(name);
                    const toggle = active ? filter.filter(filter => filter !== name) : filter.concat(name);

                    return {
                        active,
                        name,
                        href:  stateToHref('d', docId, toggle, search),
                        count: docsVisible.reduce((count, doc) => count + doc.labels.includes(name), 0),
                        total: docs       .reduce((count, doc) => count + doc.labels.includes(name), 0)
                    };
                })
    ),

    labelsNames: Baobab.monkey(['labels'], labels => labels.map(label => label.name)),

    // History
    href: Baobab.monkey(
        ['view'],
        ['docId'],
        ['filter'],
        ['search'],
        stateToHref
    ),

    // UI
    load: 1,
    pend: 1,

    filter: [],
    search: '',
    toasts: [],

    edit: false,
    last: new Date(0),
    view: undefined,

    user: Baobab.monkey(['userData'], ['userDiff'], (data, diff) => data ? Object.assign({_changed: !!diff}, data, diff) : undefined),
    userData: undefined,
    userDiff: undefined
}, {immutable: process.env.NODE_ENV === 'development'});

function stateToHref (view, docId, filter, search) {
    return [
        `#/${[view, view && docId].filter(Boolean).join('/')}`,
        [filter.length && `filter=${filter.slice().sort().join(',')}`, search && `search=${search}`].filter(Boolean).join('&')
    ].filter(Boolean).join('?');
}
