import Baobab        from 'baobab';
import createHistory from 'history/createBrowserHistory';

export const history = createHistory();
export const tree = new Baobab({
    // Data
    labels: Baobab.monkey(
        ['proofs'],
        ['proofsFiltered'],
        ['proofsFilter'],
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

    proofsCreated: {},
    proofsRemoved: {},
    proofsUpdated: {},

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

    proofsFilter: [],
    proofsFiltered: Baobab.monkey(
        ['proofs'],
        ['proofsFilter'],
        (proofs, filter) => filter.length
            ? proofs.filter(proof => filter.every(filter => proof.labels.some(label => label === filter)))
            : proofs
    ),

    proofs: Baobab.monkey(
        ['proofsPresent'],
        ['proofsUpdated'],
        (present, updated) =>
            present
                .map(x => Object.assign({_updated: !!updated[x._id]}, x, updated[x._id]))
                .sort(byName)
    ),

    proofId: null,
    proof: Baobab.monkey(
        ['proofs'],
        ['proofId'],
        (proofs, proofId) =>
            proofs.find(proof => proof._id === proofId)
    ),

    // UI
    load: true,
    view: true,
    search: '',

    // User
    user:      null,
    userError: null
}, {immutable: process.env.NODE_ENV === 'development'});

function byName (a, b) {
    return a.name.localeCompare(b.name);
}
