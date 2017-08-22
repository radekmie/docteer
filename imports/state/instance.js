import Baobab    from 'baobab';
import fuzzysort from 'fuzzysort';

export const tree = new Baobab({
    // Data
    labels: Baobab.monkey(
        ['docId'],
        ['docs'],
        ['docsVisible'],
        ['filter'],
        ['search'],
        (docId, docs, docsVisible, filter, search) =>
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

    docsCreated: Object.create(null),
    docsRemoved: Object.create(null),
    docsUpdated: Object.create(null),

    docsOrigins: [],
    docsPresent: Baobab.monkey(
        ['docsCreated'],
        ['docsOrigins'],
        ['docsRemoved'],
        (created, origins, removed) =>
            origins
                .concat(Object.keys(created).map(_id => ({_created: true, _id})))
                .map(x => Object.assign({_removed: !!removed[x._id]}, x))
    ),

    docs: Baobab.monkey(
        ['docsPresent'],
        ['docsUpdated'],
        (present, updated) =>
            present
                .map(x => Object.assign({_updated: !!updated[x._id]}, x, updated[x._id]))
                .sort((a, b) => a.name.localeCompare(b.name))
    ),

    filter: [],

    docsFiltered: Baobab.monkey(
        ['docs'],
        ['filter'],
        (docs, filter) =>
            filter
                ? docs.filter(doc => filter.every(filter => doc.labels.some(label => label === filter)))
                : docs
    ),

    docsSearched: Baobab.monkey(
        ['docsFiltered'],
        ['search'],
        (docs, search) =>
            search.trim()
                ? fuzzysort.go(search.trim(), docs.map(doc => ({doc, lower: doc.name.toLowerCase(), target: doc.name})))
                    .slice(0, 50)
                    .map(result => Object.assign({}, result.doc, {name: result.highlighted}))
                : docs
    ),

    docsVisible: Baobab.monkey(
        ['docId'],
        ['docsSearched'],
        ['filter'],
        ['search'],
        (docId, docs, filter, search) =>
            docs.map(doc => Object.assign({
                _active: doc._id === docId,
                _href: stateToHref('d', doc._id !== docId && doc._id, filter, search)
            }, doc))
    ),

    docId: null,
    doc: Baobab.monkey(
        ['docs'],
        ['docId'],
        (docs, docId) =>
            docs.find(doc => doc._id === docId)
    ),

    // UI
    edit: false,
    load: 1,
    pend: 1,
    search: '',
    toasts: [],
    view: undefined,

    // History
    href: Baobab.monkey(
        ['view'],
        ['docId'],
        ['filter'],
        ['search'],
        (view, docId, filter, search) => stateToHref(view, docId, filter, search)
    ),

    // User
    user: null
}, {immutable: process.env.NODE_ENV === 'development'});

function stateToHref (view, docId, filter, search) {
    return [
        `/${[view, view && docId].filter(Boolean).join('/')}`,
        [filter.length && `filter=${filter.slice().sort().join(',')}`, search && `search=${search}`].filter(Boolean).join('&')
    ].filter(Boolean).join('?');
}
