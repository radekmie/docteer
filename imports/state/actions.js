import {Meteor}  from 'meteor/meteor';
import {Tracker} from 'meteor/tracker';

import {tree} from './instance';

export function onAdd () {
    const _id = Math.random().toString(36).substr(2, 6);

    tree.set(['proofsUpdated', _id], {expect: '', labels: [], name: '', steps: [], target: ''});
    tree.set(['proofsCreated', _id], true);
    tree.set(['proofId'], _id);
    tree.set(['view'], false);
}

export function onChange (_id, key, value) {
    if (tree.get(['proofsUpdated', _id])) {
        tree.set(['proofsUpdated', _id, key], value);
    } else {
        tree.set(['proofsUpdated', _id], {[key]: value});
    }
}

export function onFilter (_id) {
    const index = tree.get(['filter']).indexOf(_id);

    if (index === -1) {
        tree.push(['filter'], _id);
    } else {
        tree.unset(['filter', index]);
    }
}

export function onLogin (email, password) {
    toast('info', 'Logging in...');

    Meteor.loginWithPassword(email, password, error => {
        if (error) {
            toast('error', error);
        } else {
            toast('success', 'Logged in.');
        }
    });
}

export function onLogout () {
    toast('info', 'Logging out...');

    Meteor.logout(error => {
        if (error) {
            toast('error', error);
        } else {
            toast('success', 'Logged out.');
            tree.set(['proofId'], null);
        }
    });
}

export function onRefresh (firstRun) {
    if (!Meteor.userId()) {
        tree.set(['proofsOrigins'], []);

        return Promise.resolve();
    }

    toast('info', firstRun === true ? 'Loading...' : 'Refreshing...');

    return graphQL({
        query: 'query Proofs ($session: String!, $userId: String!) { proofs (session: $session, userId: $userId) { _id expect labels name steps target } }',
        operationName: 'Proofs'
    }).then(response => {
        toast('success', firstRun === true ? 'Loaded.' : 'Refreshed.');

        tree.set(['proofsOrigins'], response.data.proofs);
    });
}

export function onRemove () {
    tree.set(['proofsRemoved', tree.get(['proofId'])], true);
    tree.set(['proofId'], null);
}

export function onReset () {
    tree.set(['proofsCreated'], Object.create(null));
    tree.set(['proofsRemoved'], Object.create(null));
    tree.set(['proofsUpdated'], Object.create(null));
}

export function onSave () {
    tree.set(['view'], true);

    const created = tree.get(['proofsCreated']);
    const removed = tree.get(['proofsRemoved']);
    const updated = tree.get(['proofsUpdated']);

    const patch = {
        created: Object.keys(created),
        removed: Object.keys(removed),
        updated: Object.keys(updated).map(_id => Object.assign({_id}, updated[_id]))
    };

    const skippable = patch.created.filter(_id => patch.removed.includes(_id));

    patch.created = patch.created.filter(_id => !skippable.includes(_id));
    patch.removed = patch.removed.filter(_id => !skippable.includes(_id));
    patch.updated = patch.updated.filter(doc => !skippable.includes(doc._id));

    if (!patch.created.length && !patch.removed.length && !patch.updated.length) {
        onReset();

        return Promise.resolve();
    }

    toast('info', 'Saving...');

    return graphQL({
        query: 'mutation ProofsPatch ($session: String!, $userId: String!, $created: [String!]!, $removed: [String!]!, $updated: [ProofPatch!]!) { proofsPatch (session: $session, userId: $userId, created: $created, removed: $removed, updated: $updated) { _id expect labels name steps target } }',
        operationName: 'ProofsPatch',
        variables: patch
    }).then(response => {
        toast('success', 'Saved.');
        tree.set(['proofsOrigins'], response.data.proofsPatch);
        onReset();
    });
}

export function onSearch (search) {
    tree.set(['search'], search);
}

export function onView () {
    if (tree.set(['view'], !tree.get(['view']))) {
        onReset();
    }
}

function graphQL (body) {
    const json = 'application/json';

    return fetch('/graphql', {
        method: 'POST',
        headers: new Headers({
            'Accept':       json,
            'Content-Type': json
        }),
        body: JSON.stringify(Object.assign({}, body, {
            variables: Object.assign({}, body.variables, {
                session: Meteor.connection._lastSessionId,
                userId:  Meteor.userId()
            })
        }))
    }).then(response => {
        if (response.ok) {
            return response.json().then(response => {
                if (response.errors) {
                    throw new Error(response.errors[0].message);
                }

                return response;
            });
        }

        throw new Error(response.statusText);
    }).catch(error => {
        toast('error', error);
        throw error;
    });
}

function toast (type, textOrError) {
    const _id = Math.random();
    const text = type === 'error'
        ? textOrError.error === 403
            ? 'Sounds good, doesn\'t work.'
            : textOrError.reason || textOrError.message
        : textOrError
    ;

    tree.push(['toasts'], {_id, dead: false, text, type});

    setTimeout(() => {
        tree.set(['toasts', {_id}, 'dead'], true);

        setTimeout(() => {
            tree.unset(['toasts', {_id}]);
        }, 250);
    }, 1500);
}
