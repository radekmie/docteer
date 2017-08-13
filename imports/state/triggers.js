import {Meteor}  from 'meteor/meteor';
import {Tracker} from 'meteor/tracker';

import {Proofs} from '/imports/api/proofs';
import {Users}  from '/imports/api/users';

import {history, tree} from './instance';

// Collections
Meteor.subscribe('users.self', () => {
    bindCursorToPath(Proofs.find(), 'proofsOrigins');

    Tracker.autorun(() => {
        Meteor.userId();
        Meteor.subscribe('proofs.mine', () => {
            syncHistory(history.location);

            tree.set(['load'], false);
        });
    });

    Users.find().observe({
        added:   user,
        changed: user,
        removed: user
    });
});

// Events
document.addEventListener('click', event => {
    if (event.altKey || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey) {
        return;
    }

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

// History
history.listen(syncHistory);

// Tree
tree.select(['labels']).on('update', event => {
    const filter = tree.get(['proofsFilter']);
    const filtered = filter.filter(name => event.data.currentData.find(label => label.name === name));

    if (filter.length !== filtered.length) {
        tree.set(['proofsFilter'], filtered);
    }
});

tree.select(['load']).on('update', event => {
    document.querySelector('#app').classList.toggle('loading', event.data.currentData);
});

tree.select(['proofId']).on('update', event => {
    const _id = event.data.currentData;
    const pathname = tree.get(['proofs']).find(proof => proof._id === _id) ? _id : '';

    if (pathname !== history.location.pathname.slice(1)) {
        history.push({pathname: '/' + pathname, search: history.location.search});
    }
});

tree.select(['proofsFilter']).on('update', event => {
    const search = filterToSearch(event.data.currentData.slice());

    if (history.location.search === search) {
        return;
    }

    history.push({pathname: history.location.pathname, search});
});

// Helpers
function bindCursorToPath (cursor, path) {
    const base = tree.select([path]);

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
    tree.set(['search'], location.search);

    const _id = location.pathname.slice(1);

    if (_id !== tree.get(['proofId'])) {
        tree.set(['proofId'], tree.get(['proofs']).find(proof => proof._id === _id) ? _id : null);
    }

    const filter = searchToFilter(location.search);

    if (JSON.stringify(filter) !== JSON.stringify(tree.get(['proofsFilter']))) {
        tree.set(['proofsFilter'], filter);
    }
}

function user () {
    Tracker.afterFlush(() => {
        tree.set(['user'], Meteor.user() || null);
    });
}
