import {Meteor} from 'meteor/meteor';

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
    tree.set(['error'], null);
    tree.set(['load'], tree.get(['load']) + 1);

    Meteor.loginWithPassword(email, password, error => {
        if (error) {
            tree.set(['error'], error);
        }

        tree.set(['load'], tree.get(['load']) - 1);
    });
}

export function onLogout () {
    tree.set(['load'], tree.get(['load']) + 1);

    Meteor.logout(error => {
        if (error) {
            tree.set(['error'], error);
        }

        tree.set(['proofId'], null);
        tree.set(['load'], tree.get(['load']) - 1);
    });
}

export function onRefresh () {
    if (!Meteor.userId()) {
        tree.set(['proofsOrigins'], []);

        return Promise.resolve();
    }

    return graphQL({
        query: 'query Proofs ($session: String!, $userId: String!) { proofs (session: $session, userId: $userId) { _id expect labels name steps target } }',
        operationName: 'Proofs'
    }).then(response => {
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

    // Optimistic UI
    tree.set(['proofsOrigins'], tree.get(['proofs']).reduce((proofs, doc) => {
        if (doc._removed) {
            return proofs;
        }

        const  proof = Object.assign({}, doc);
        delete proof._created;
        delete proof._removed;
        delete proof._updated;

        proofs.push(proof);

        return proofs;
    }, []));

    onReset();

    return graphQL({
        query: 'mutation ProofsPatch ($session: String!, $userId: String!, $created: [String!]!, $removed: [String!]!, $updated: [ProofPatch!]!) { proofsPatch (session: $session, userId: $userId, created: $created, removed: $removed, updated: $updated) { _id expect labels name steps target } }',
        operationName: 'ProofsPatch',
        variables: patch
    }).then(response => {
        tree.set(['proofsOrigins'], response.data.proofsPatch);
    });
}

export function onSearch (search) {
    tree.set(['search'], search);
}

export function onView () {
    if (tree.get(['view'])) {
        tree.set(['view'], false);
    } else {
        onSave();
    }
}

function graphQL (body) {
    const json = 'application/json';

    tree.set(['load'], tree.get(['load']) + 1);
    tree.set(['error'], null);

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
    }).then(response => {
        tree.set(['load'], tree.get(['load']) - 1);
        tree.set(['error'], null);

        return response;
    }, error => {
        tree.set(['load'], tree.get(['load']) - 1);
        tree.set(['error'], error);

        throw error;
    });
}
