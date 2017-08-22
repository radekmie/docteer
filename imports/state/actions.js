import {Accounts} from 'meteor/accounts-base';
import {Meteor}   from 'meteor/meteor';

import {schemaEmpty} from '/imports/lib/schemas';

import {tree} from './instance';

export function onAdd () {
    const _id = Math.random().toString(36).substr(2, 6);

    const schema = tree.get(['user']).schemas[0];

    tree.set(['docsUpdated', _id], Object.assign({_outline: schema}, schemaEmpty(schema)));
    tree.set(['docsCreated', _id], true);
    tree.set(['docId'], _id);
    tree.set(['edit'], true);
}

export function onChange (_id, key, value) {
    if (tree.get(['docsUpdated', _id])) {
        tree.set(['docsUpdated', _id, key], value);
    } else {
        tree.set(['docsUpdated', _id], {[key]: value});
    }
}

export function onEdit () {
    if (!tree.set(['edit'], !tree.get(['edit']))) {
        onReset();
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
            tree.set(['docId'], undefined);
        }
    });
}

export function onRefresh (firstRun) {
    if (!Meteor.userId()) {
        tree.set(['docsOrigins'], []);

        return Promise.resolve();
    }

    toast('info', firstRun === true ? 'Loading...' : 'Refreshing...');

    return graphQL({
        query: 'query Docs ($session: String!, $userId: String!) { docs (session: $session, userId: $userId) }',
        operationName: 'Docs'
    }).then(response => {
        toast('success', firstRun === true ? 'Loaded.' : 'Refreshed.');
        tree.set(['docsOrigins'], response.data.docs);
    });
}

export function onRemove () {
    tree.set(['docsRemoved', tree.get(['docId'])], true);
    tree.set(['docId'], undefined);
}

export function onReset () {
    if (tree.get(['docsCreated'])[tree.get(['docId'])]) {
        tree.set(['docId'], undefined);
    }

    tree.set(['docsCreated'], Object.create(null));
    tree.set(['docsRemoved'], Object.create(null));
    tree.set(['docsUpdated'], Object.create(null));
}

export function onSave () {
    tree.set(['edit'], false);

    const created = tree.get(['docsCreated']);
    const removed = tree.get(['docsRemoved']);
    const updated = tree.get(['docsUpdated']);

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
        query: 'mutation DocsPatch ($session: String!, $userId: String!, $created: [String!]!, $removed: [String!]!, $updated: [Doc!]!) { docsPatch (session: $session, userId: $userId, created: $created, removed: $removed, updated: $updated) }',
        operationName: 'DocsPatch',
        variables: patch
    }).then(response => {
        toast('success', 'Saved.');
        tree.set(['docsOrigins'], response.data.docsPatch);
        onReset();
    });
}

export function onSearch (event) {
    tree.set(['search'], event.target.value);
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
                session: Accounts._storedLoginToken(),
                userId:  Accounts._storedUserId()
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

    if (type === 'info') {
        tree.set(['pend'], tree.get(['pend']) + 1);
    } else {
        setTimeout(() => {
            tree.set(['pend'], tree.get(['pend']) - 1);
        }, 750);
    }

    setTimeout(() => {
        tree.set(['toasts', {_id}, 'dead'], true);
    }, 1500);

    setTimeout(() => {
        tree.unset(['toasts', {_id}]);
    }, 1750);
}
