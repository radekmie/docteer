import Baobab        from 'baobab';
import createHistory from 'history/createBrowserHistory';

import {Meteor} from 'meteor/meteor';

import {Proofs} from '/imports/api/proofs';

export const history = window._history = createHistory();
export const central = window._central = new Baobab({
    labels: Baobab.monkey(
        ['proofs'],
        ['proofsFiltered'],
        ['proofsFilter'],
        (a, b, f) => a
            .reduce((labels, proof) => (proof.labels.forEach(label => labels.includes(label) || labels.push(label)), labels), [])
            .sort()
            .map(name => ({
                active: f.includes(name),
                name,
                count: b.reduce((a, b) => a + b.labels.includes(name), 0),
                total: a.reduce((a, b) => a + b.labels.includes(name), 0)
            }))
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
    const search = filterToSearch(event.data.currentData.slice());

    if (history.location.search === search)
        return;

    history.push({pathname: history.location.pathname, search});
});

central.select(['view']).on('update', event => {
    if (event.data.currentData === false)
        return;

    const patch = {
        created: Object.keys(central.get(['proofsCreated'])),
        removed: Object.keys(central.get(['proofsRemoved'])),
        updated: central.get(['proofsUpdated'])
    };

    if (!patch.created.length && !patch.removed.length && !Object.keys(patch.updated).length)
        return;

    central.set(['load'], true);

    Meteor.call('patch', patch, error => {
        if (error)
            alert(error.error);

        central.set(['proofsCreated'], {});
        central.set(['proofsRemoved'], {});
        central.set(['proofsUpdated'], {});
        central.set(['load'], false);
    });
});

history.listen(syncHistory);

bindCursorToPath(Proofs.find(), 'proofsOrigins');

central.set(['load'], true);
central.set(['view'], true);

const handles = [Meteor.subscribe('proofs', subscribed)];

central.select(['load']).once('update', () => {
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

function collection (name) {
    const created = name + 'Created';
    const origins = name + 'Origins';
    const present = name + 'Present';
    const removed = name + 'Removed';
    const updated = name + 'Updated';

    return {
        [origins]: [],
        [present]: Baobab.monkey(
            [created],
            [origins],
            [removed],
            (created, origins, removed) =>
                origins
                    .concat(Object.keys(created).map(_id => ({_created: true, _id})))
                    .map(x => Object.assign({_removed: !!removed[x._id]}, x))
        ),

        [created]: {},
        [removed]: {},
        [updated]: {},

        [name]: Baobab.monkey(
            [present],
            [updated],
            (present, updated) =>
                present
                    .map(x => Object.assign({_updated: !!updated[x._id]}, x, updated[x._id]))
                    .sort(byName)
        )
    };
}

function filterToSearch (filter) {
    return filter.length ? `?filter=${filter.sort().join(',')}` : '';
}

function searchToFilter (search) {
    return search ? search.replace(/^\?filter=/, '').split(',').sort() : [];
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
