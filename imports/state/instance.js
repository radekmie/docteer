import Baobab from 'baobab';
import Fuse   from 'fuse.js';

const config = {
    findAllMatches: true,
    includeMatches: true,
    keys: ['name'],
    maxPatternLength: Infinity,
    minMatchCharLength: 2,
    tokenize: true
};

export const tree = new Baobab({
    // Data
    labels: Baobab.monkey(
        ['docId'],
        ['docs'],
        ['docsVisible'],
        ['filter'],
        (docId, docs, docsVisible, filter) =>
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
                        href:  `/${docId || ''}${toggle.length ? `?filter=${toggle.sort().join(',')}` : ''}`,
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
    filterString: Baobab.monkey(
        ['filter'],
        filter => filter.length ? `?filter=${filter.slice().sort().join(',')}` : ''
    ),

    docsFiltered: Baobab.monkey(
        ['docs'],
        ['filter'],
        (docs, filter) =>
            filter
                ? docs.filter(doc => filter.every(filter => doc.labels.some(label => label === filter)))
                : docs
    ),

    docsVisible: Baobab.monkey(
        ['docsFiltered'],
        ['search'],
        (docs, search) =>
            search.trim()
                ? new Fuse(docs, config)
                    .search(search.trim())
                    .slice(0, 50)
                    .map(result => Object.assign({}, result.item, {
                        name: result.matches[0].indices.reduceRight(
                            (name, range) =>
                                name.slice(0, range[0]) + '<b>' +
                                name.slice(range[0], range[1] + 1) + '</b>' +
                                name.slice(range[1] + 1),
                            result.item.name
                        )
                    }))
                : docs
    ),

    docId: undefined,
    doc: Baobab.monkey(
        ['docs'],
        ['docId'],
        (docs, docId) =>
            docs.find(doc => doc._id === docId)
    ),

    // UI
    load: 1,
    pend: 1,
    search: '',
    toasts: [],
    view: true,

    // User
    user: null
}, {immutable: process.env.NODE_ENV === 'development'});
