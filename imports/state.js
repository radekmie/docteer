import Baobab        from 'baobab';
import createHistory from 'history/createBrowserHistory';

import {Meteor} from 'meteor/meteor';

import {Proofs} from '/imports/api/proofs';

export const history = window._history = createHistory();
export const central = window._central = new Baobab({
    labels: Baobab.monkey(
        ['proofs'],
        proofs => Array.from(proofs.reduce(
            (labels, proof) => (proof.labels.forEach(label => labels.add(label)), labels),
            new Set()
        )).sort()
    ),

    ...collection('proofs'),

    proofsFilter: [],
    proofsFiltered: Baobab.monkey(
        ['proofs'],
        ['proofsFilter'],
        (proofs, filter) => filter.length
            ? proofs.filter(proof => filter.every(filter => proof.labels.some(label => label === filter)))
            : proofs
    )
}, {immutable: process.env.NODE_ENV === 'development'});

central.select(['load']).on('update', event => {
    document.getElementById('application').classList.toggle('loading', event.data.currentData);
});

central.select(['proof']).on('update', event => {
    const _id = event.data.currentData;
    const pathname = central.get(['proofs']).find(proof => proof._id === _id) ? _id : '';

    if (pathname !== history.location.pathname.slice(1))
        history.push({pathname: '/' + pathname, search: history.location.search});
});

central.select(['proofsFilter']).on('update', event => {
    const search = filterToSearch(event.data.currentData);

    if (history.location.search === search)
        return;

    history.push({pathname: history.location.pathname, search});
});

central.select(['view']).on('update', event => {
    if (event.data.currentData === false)
        return;

    const patch = central.get(['proofsLocal']);

    if (!Object.keys(patch).length)
        return;

    central.set(['load'], true);

    Meteor.call('patch', patch, error => {
        if (error)
            alert(error.error);

        central.set(['proofsLocal'], {});
        central.set(['load'], false);
    });
});

history.listen(syncHistory);

bindCursorToPath(Proofs.find(), 'proofsRemote');

central.set(['load'], true);
central.set(['view'], true);

const handles = [Meteor.subscribe('proofs', subscribed)];

central.once(['load'], () => {
    central.set(['proof'], history.location.pathname.slice(1) || undefined);
    central.set(['proofsFilter'], central.set(['proofsFilter'], searchToFilter(location.search)));

    syncHistory(history.location);
});


function byName (a, b) {
    return a.name.localeCompare(b.name);
}

function bindCursorToPath (cursor, path) {
    const base = central.select([path]);

    cursor.observe({
        added:   doc => base.set(base.get().concat(doc)),
        removed: doc => base.set(base.get().filter(obj => obj._id !== doc._id)),
        changed: doc => base.set(base.get().map(obj => obj._id === doc._id ? doc : obj))
    });
}

function collection (prefix) {
    const B = prefix;
    const L = prefix + 'Local';
    const R = prefix + 'Remote';

    return {
        [B]: Baobab.monkey([L], [R], (l, r) => r.map(x => Object.assign({}, x, l[x._id])).sort(byName)),
        [L]: {},
        [R]: []
    };
}

function filterToSearch (filter) {
    return filter.length ? `?filter=${filter.join(',')}` : '';
}

function searchToFilter (search) {
    return search ? search.replace(/^\?filter=/, '').split(',') : [];
}

function subscribed () {
    central.set(['load'], handles.some(handle => !handle.ready()));
}

function syncHistory (location) {
    const _id = location.pathname.slice(1);

    if (_id !== central.get(['proof']))
        central.set(['proof'], central.get(['proofs']).find(proof => proof._id === _id) ? _id : undefined);

    const filter = searchToFilter(location.search);

    if (JSON.stringify(filter) !== JSON.stringify(central.get(['proofsFilter'])))
        central.set(['proofsFilter'], filter);
}
