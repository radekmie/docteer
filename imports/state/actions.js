import {Meteor} from 'meteor/meteor';

import {tree} from './instance';

export function onAdd () {
    const _id = Math.random().toString(36).substr(2, 8);

    tree.set(['proofsUpdated', _id], {expect: '', labels: [], name: '', steps: [], target: ''});
    tree.set(['proofsCreated', _id], true);
    tree.set(['proofId'], _id);
    tree.set(['view'], false);
}

export function onChange (_id, key, value) {
    tree.get(['proofsUpdated', _id])
        ? tree.set(['proofsUpdated', _id, key], value)
        : tree.set(['proofsUpdated', _id], {[key]: value})
    ;
}

export function onFilter (_id) {
    const index = tree.get(['proofsFilter']).indexOf(_id);

    index === -1
        ? tree.push(['proofsFilter'], _id)
        : tree.unset(['proofsFilter', index])
    ;
}

export function onLogin (email, password) {
    tree.set(['error'], null);
    tree.set(['load'],  true);

    Meteor.loginWithPassword(email, password, error => {
        if (error)
            tree.set(['error'], error.error);

        tree.set(['load'], false);
    });
}

export function onLogout () {
    tree.set(['load'], true);

    Meteor.logout(() => {
        tree.set(['proofId'], null);
        tree.set(['load'], false);
    });
}

export function onRemove () {
    tree.set(['proofsRemoved', tree.get(['proofId'])], true);
    tree.set(['proofId'], null);
}

export function onSave () {
    tree.set(['view'], true);
}

export function onView () {
    tree.set(['proofsCreated'], {});
    tree.set(['proofsRemoved'], {});
    tree.set(['proofsUpdated'], {});
    tree.set(['view'], !tree.get('view'));
}
