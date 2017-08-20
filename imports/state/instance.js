import Baobab        from 'baobab';
import Fuse          from 'fuse.js';
import createHistory from 'history/createBrowserHistory';

const config = {
    findAllMatches: true,
    includeMatches: true,
    keys: ['name'],
    maxPatternLength: Infinity,
    minMatchCharLength: 2,
    tokenize: true
};

export const history = createHistory();
export const tree = new Baobab({
    // Data
    labels: Baobab.monkey(
        ['proofs'],
        ['proofsVisible'],
        ['filter'],
        (proofs, proofsVisible, filter) =>
            proofs
                .reduce((labels, proof) => {
                    proof.labels.forEach(label => {
                        if (label && !labels.includes(label)) {
                            labels.push(label);
                        }
                    });

                    return labels;
                }, [])
                .sort()
                .map(name => ({
                    active: filter.includes(name),
                    name,
                    count: proofsVisible.reduce((count, proof) => count + proof.labels.includes(name), 0),
                    total: proofs       .reduce((count, proof) => count + proof.labels.includes(name), 0)
                }))
    ),

    proofsCreated: Object.create(null),
    proofsRemoved: Object.create(null),
    proofsUpdated: Object.create(null),

    proofsOrigins: [],
    proofsPresent: Baobab.monkey(
        ['proofsCreated'],
        ['proofsOrigins'],
        ['proofsRemoved'],
        (created, origins, removed) =>
            origins
                .concat(Object.keys(created).map(_id => ({_created: true, _id})))
                .map(x => Object.assign({_removed: !!removed[x._id]}, x))
    ),

    proofs: Baobab.monkey(
        ['proofsPresent'],
        ['proofsUpdated'],
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

    proofsFiltered: Baobab.monkey(
        ['proofs'],
        ['filter'],
        (proofs, filter) =>
            filter
                ? proofs.filter(proof => filter.every(filter => proof.labels.some(label => label === filter)))
                : proofs
    ),

    proofsVisible: Baobab.monkey(
        ['proofsFiltered'],
        ['search'],
        (proofs, search) =>
            search
                ? new Fuse(proofs, config)
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
                : proofs
    ),

    proofId: undefined,
    proof: Baobab.monkey(
        ['proofs'],
        ['proofId'],
        (proofs, proofId) =>
            proofs.find(proof => proof._id === proofId)
    ),

    // UI
    load: 1,
    pend: 0,
    search: '',
    toasts: [],
    view: true,

    // User
    user: null
}, {immutable: process.env.NODE_ENV === 'development'});
