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
    const index = tree.get(['proofsFilter']).indexOf(_id);

    if (index === -1) {
        tree.push(['proofsFilter'], _id);
    } else {
        tree.unset(['proofsFilter', index]);
    }
}

export function onLogin (email, password) {
    tree.set(['error'], null);
    tree.set(['load'],  true);

    Meteor.loginWithPassword(email, password, error => {
        if (error) {
            tree.set(['error'], error);
        }

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

export function onReset () {
    tree.set(['proofsCreated'], Object.create(null));
    tree.set(['proofsRemoved'], Object.create(null));
    tree.set(['proofsUpdated'], Object.create(null));
}

export function onSave () {
    tree.set(['view'], true);

    const patch = {
        created: Object.keys(tree.get(['proofsCreated'])),
        removed: Object.keys(tree.get(['proofsRemoved'])),
        updated: Object.assign(Object.create(null), tree.get(['proofsUpdated']))
    };

    const skippable = patch.created.filter(_id => patch.removed.includes(_id));

    patch.created = patch.created.filter(_id => !skippable.includes(_id));
    patch.removed = patch.removed.filter(_id => !skippable.includes(_id));

    skippable.forEach(_id => {
        delete patch.updated[_id];
    });

    if (!patch.created.length && !patch.removed.length && !Object.keys(patch.updated).length) {
        onReset();

        return;
    }

    tree.set(['load'], true);

    Meteor.call('proofs.patch', patch, error => {
        if (error) {
            tree.set(['error'], error);
        } else {
            onReset();
        }

        tree.set(['load'], false);
    });
}

export function onView () {
    if (tree.get(['view'])) {
        tree.set(['view'], false);
    } else {
        onSave();
    }
}
