import Baobab        from 'baobab';
import createHistory from 'history/createBrowserHistory';

export const history = createHistory();
export const tree = new Baobab({
    // Data
    labels: Baobab.monkey(
        ['proofs'],
        ['proofsFiltered'],
        ['filter'],
        (a, b, f) => a
            .reduce((labels, proof) => {
                proof.labels.forEach(label => {
                    if (label && !labels.includes(label))
                        labels.push(label);
                });

                return labels;
            }, [])
            .sort()
            .map(name => ({
                active: f.includes(name),
                name,
                count: b.reduce((a, b) => a + b.labels.includes(name), 0),
                total: a.reduce((a, b) => a + b.labels.includes(name), 0)
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
                .sort(byName)
    ),

    filter: [],
    filterString: Baobab.monkey(
        ['filter'],
        filter => filter.length ? `?filter=${filter.slice().sort().join(',')}` : ''
    ),

    proofsFiltered: Baobab.monkey(
        ['proofs'],
        ['filter'],
        ['search'],
        (proofs, filter, search) => {
            if (filter) {
                proofs = proofs.filter(proof => filter.every(filter => proof.labels.some(label => label === filter)));
            }

            if (search) {
                search = new RegExp(search, 'i');
                proofs = proofs.filter(proof => search.test(proof.name));
            }

            return proofs;
        }
    ),

    proofId: undefined,
    proof: Baobab.monkey(
        ['proofs'],
        ['proofId'],
        (proofs, proofId) =>
            proofs.find(proof => proof._id === proofId)
    ),

    // UI
    load: 0,
    view: true,
    search: '',
    toasts: [],

    // User
    user: null
}, {immutable: process.env.NODE_ENV === 'development'});

function byName (a, b) {
    return a.name.localeCompare(b.name);
}
