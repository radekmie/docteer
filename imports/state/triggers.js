import createHistory from 'history/createBrowserHistory';

import {Meteor}  from 'meteor/meteor';
import {Tracker} from 'meteor/tracker';

import {onRefresh} from './actions';
import {tree}      from './instance';

const history = createHistory();

// Collections
Meteor.subscribe('users.self', {
    onReady: subscribed,
    onStop:  subscribed
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
    const filterAvailable = filter.filter(name => event.data.currentData.find(label => label.name === name));

    if (filter.length !== filterAvailable.length) {
        tree.set(['filter'], filterAvailable);
    }
});

tree.select(['docId']).on('update', event => {
    const _id = event.data.currentData;
    const pathname = tree.get(['docs']).find(doc => doc._id === _id) ? _id : '';

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
    return search ? decodeURIComponent(search.replace(/^\?filter=/, '')).split(',').sort() : [];
}

function subscribed () {
    let firstRun = true;
    const update = () => {
        syncHistory(history.location);

        if (firstRun) {
            firstRun = false;
            tree.set(['load'], tree.get(['load']) - 1);
            tree.set(['pend'], tree.get(['pend']) - 1);
        }
    };

    Tracker.autorun(() => {
        if (!tree.set(['user'], Meteor.user() || null)) {
            update();
        }
    });

    tree.select(['user']).on('update', () => {
        onRefresh(true).then(update);
    });
}

function syncHistory (location) {
    const _id = location.pathname.slice(1);

    if (_id !== tree.get(['docId'])) {
        tree.set(['docId'], tree.get(['docs']).find(doc => doc._id === _id) ? _id : null);
    }

    const filter = searchToFilter(location.search);

    if (JSON.stringify(filter) !== JSON.stringify(tree.get(['filter']))) {
        tree.set(['filter'], filter);
    }
}
