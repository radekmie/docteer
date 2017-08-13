import {Meteor}  from 'meteor/meteor';
import {Tracker} from 'meteor/tracker';

import {Proofs} from '/imports/api/proofs';
import {Users}  from '/imports/api/users';

import {history, tree} from './instance';

// Collections
Meteor.subscribe('users.self', () => {
    const cursor = Proofs.find();

    Tracker.autorun(() => {
        tree.set(['proofsOrigins'], cursor.fetch());
    });

    Tracker.autorun(computation => {
        if (Meteor.userId()) {
            Meteor.subscribe('proofs.mine', () => {
                tree.set(['proofsOrigins'], cursor.fetch());
                tree.set(['load'], false);

                syncHistory(history.location);
            });
        } else if (computation.firstRun) {
            syncHistory(history.location);
        }
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
    const filter = tree.get(['filter']);
    const proofsFiltered = filter.filter(name => event.data.currentData.find(label => label.name === name));

    if (filter.length !== proofsFiltered.length) {
        tree.set(['filter'], proofsFiltered);
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

tree.select(['filter']).on('update', event => {
    const search = filterToSearch(event.data.currentData.slice());

    if (history.location.search === search) {
        return;
    }

    history.push({pathname: history.location.pathname, search});
});

// Helpers
function filterToSearch (filter) {
    return filter.length ? `?filter=${filter.sort().join(',')}` : '';
}

function searchToFilter (search) {
    return search ? search.replace(/^\?filter=/, '').split(',').sort() : [];
}

function syncHistory (location) {
    const _id = location.pathname.slice(1);

    if (_id !== tree.get(['proofId'])) {
        tree.set(['proofId'], tree.get(['proofs']).find(proof => proof._id === _id) ? _id : null);
    }

    const filter = searchToFilter(location.search);

    if (JSON.stringify(filter) !== JSON.stringify(tree.get(['filter']))) {
        tree.set(['filter'], filter);
    }
}

function user () {
    Tracker.afterFlush(() => {
        tree.set(['user'], Meteor.user() || null);
    });
}
