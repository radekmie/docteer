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
tree.select(['href']).on('update', event => {
    const path = event.data.currentData.split('?');
    const search = path[1] ? `?${path[1]}` : '';

    if (history.location.pathname !== path[0] || history.location.search !== search) {
        history.push({pathname: path[0], search});
    }
});

tree.select(['labels']).on('update', event => {
    const filter = tree.get(['filter']);
    const filterAvailable = filter.filter(name => event.data.currentData.find(label => label.name === name));

    if (filter.length !== filterAvailable.length) {
        tree.set(['filter'], filterAvailable);
    }
});

// Helpers
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
        if (!tree.set(['user'], Meteor.user())) {
            update();
        }
    });

    tree.select(['user']).on('update', () => {
        onRefresh(true).then(update);
    });
}

const pattern = /^\/(\w)?(?:\/(\w+))?.*?(?:[&?]filter=([^&?]+))?(?:[&?]search=([^&?]+))?.*$/;

function syncHistory (location) {
    const match = pattern.exec(location.pathname + location.search);
    const state = {
        docId:  match[1] === 'd' && match[2] || undefined,
        filter: match[3] ? decodeURIComponent(match[3]).split(',').sort() : [],
        search: match[4] ? decodeURIComponent(match[4]) : '',
        view:   match[1] || 'd'
    };

    tree.set(['docId'],  tree.get(['docs']).find(doc => doc._id === state.docId) ? state.docId : null);
    tree.set(['search'], state.search);
    tree.set(['view'],   state.view);

    if (JSON.stringify(tree.get(['filter'])) !== JSON.stringify(state.filter)) {
        tree.set(['filter'], state.filter);
    }
}
