import Baobab        from 'baobab';
import createHistory from 'history/createBrowserHistory';

import {Meteor}  from 'meteor/meteor';
import {Tracker} from 'meteor/tracker';

import {Proofs} from '/imports/api/proofs';

export const history = createHistory();
export const central = new Baobab({
    load: true,
    view: true,

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

    user:      null,
    userError: null,

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

    proofsCreated: {},
    proofsRemoved: {},
    proofsUpdated: {},

    search: '',

    proofs: Baobab.monkey(
        ['proofsPresent'],
        ['proofsUpdated'],
        (present, updated) =>
            present
                .map(x => Object.assign({_updated: !!updated[x._id]}, x, updated[x._id]))
                .sort(byName)
    ),

    proof: Baobab.monkey(
        ['proofs'],
        ['proofId'],
        (proofs, proofId) =>
            proofs.find(proof => proof._id === proofId)
    ),

    proofId: null,
    proofsFilter: [],
    proofsFiltered: Baobab.monkey(
        ['proofs'],
        ['proofsFilter'],
        (proofs, filter) => filter.length
            ? proofs.filter(proof => filter.every(filter => proof.labels.some(label => label === filter)))
            : proofs
    )
}, {immutable: process.env.NODE_ENV === 'development'});

central.onAdd = () => {
    const _id = Math.random().toString(36).substr(2, 8);

    central.set(['proofsUpdated', _id], {expect: '', labels: [], name: '', steps: [], target: ''});
    central.set(['proofsCreated', _id], true);
    central.set(['proofId'], _id);
    central.set(['view'], false);
};

central.onChange = (_id, key, value) => {
    central.get(['proofsUpdated', _id])
        ? central.set(['proofsUpdated', _id, key], value)
        : central.set(['proofsUpdated', _id], {[key]: value})
    ;
};

central.onFilter = _id => {
    const index = central.get(['proofsFilter']).indexOf(_id);

    index === -1
        ? central.push(['proofsFilter'], _id)
        : central.unset(['proofsFilter', index])
    ;
};

central.onLogin = (email, password) => {
    central.set(['error'], null);
    central.set(['load'],  true);

    Meteor.loginWithPassword(email, password, error => {
        if (error)
            central.set(['error'], error.error);

        central.set(['load'], false);
    });
};

central.onLogout = () => {
    central.set(['load'], true);

    Meteor.logout(() => {
        central.set(['proofId'], null);
        central.set(['load'], false);
    });
};

central.onRemove = () => {
    central.set(['proofsRemoved', central.get(['proofId'])], true);
    central.set(['proofId'], null);
};

central.onSave = () => {
    central.set(['view'], true);
};

central.onView = () => {
    central.set(['proofsCreated'], {});
    central.set(['proofsRemoved'], {});
    central.set(['proofsUpdated'], {});
    central.set(['view'], !central.get('view'));
};

central.select(['labels']).on('update', event => {
    const filter = central.get(['proofsFilter']);
    const filtered = filter.filter(name => event.data.currentData.find(label => label.name === name));

    if (filter.length !== filtered.length)
        central.set(['proofsFilter'], filtered);
});

central.select(['load']).on('update', event => {
    document.getElementById('app').classList.toggle('loading', event.data.currentData);
});

central.select(['proofId']).on('update', event => {
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

document.addEventListener('click', event => {
    if (event.altKey || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey)
        return;

    let node = event.target;
    do {
        if (String(node.nodeName).toLowerCase() === 'a' && node.getAttribute('href') && (node.__preactattr_ || node[Symbol.for('preactattr')])) {
            event.stopImmediatePropagation && event.stopImmediatePropagation();
            event.stopPropagation && event.stopPropagation();
            event.preventDefault();

            history.push(node.getAttribute('href'));

            return;
        }
    } while ((node = node.parentNode));
});

bindCursorToPath(Proofs.find(), 'proofsOrigins');

Meteor.users.find().observe({
    added:   user,
    changed: user,
    removed: user
});

Meteor.subscribe('profile', () => {
    Tracker.autorun(() => {
        Meteor.userId();
        Meteor.subscribe('proofs', () => {
            syncHistory(history.location);
            central.set(['load'], false);
        });
    });
});

function byName (a, b) {
    return a.name.localeCompare(b.name);
}

function bindCursorToPath (cursor, path) {
    const base = central.select([path]);

    cursor.observe({
        added:   doc => base.set(base.get().concat(doc)),
        changed: doc => base.set(base.get().map(obj => obj._id === doc._id ? doc : obj)),
        removed: doc => base.set(base.get().filter(obj => obj._id !== doc._id))
    });
}

function filterToSearch (filter) {
    return filter.length ? `?filter=${filter.sort().join(',')}` : '';
}

function searchToFilter (search) {
    return search ? search.replace(/^\?filter=/, '').split(',').sort() : [];
}

function syncHistory (location) {
    central.set(['search'], location.search);

    const _id = location.pathname.slice(1);

    if (_id !== central.get(['proofId']))
        central.set(['proofId'], central.get(['proofs']).find(proof => proof._id === _id) ? _id : null);

    const filter = searchToFilter(location.search);

    if (JSON.stringify(filter) !== JSON.stringify(central.get(['proofsFilter'])))
        central.set(['proofsFilter'], filter);
}

function user () {
    Tracker.afterFlush(() => {
        central.set(['user'], Meteor.user() || null);
    });
}
