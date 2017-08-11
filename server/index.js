import {minify} from 'html-minifier';

import {Accounts}    from 'meteor/accounts-base';
import {Boilerplate} from 'meteor/boilerplate-generator';
import {Meteor}      from 'meteor/meteor';
import {check}       from 'meteor/check';

import {Proofs} from '/imports/api/proofs';

if (Meteor.users.find({}, {fields: {_id: 1}, limit: 1}).count() === 0)
    Accounts.createUser({email: 'admin@doctear.com', password: 'doctear'});

if (process.env.NODE_ENV === 'production') {
    const options = {
        collapseWhitespace: true,
        minifyCSS: true,
        minifyJS: true
    };

    const rawToHTML = Boilerplate.prototype.toHTML;
    Boilerplate.prototype.toHTML = function toHTML () {
        return minify(rawToHTML.call(this, arguments), options)
            .replace('<html>', '<html lang="en">')
            .replace(/rel="stylesheet"/g, 'as="style" onload="this.rel=\'stylesheet\'" rel="preload"')
        ;
    };
}

Proofs._ensureIndex({userId: 1});

Meteor.publish('profile', function profile () {
    return Meteor.users.find({_id: this.userId}, {fields: {emails: 1}});
});

Meteor.publish('proofs', function proofs () {
    return Proofs.find({userId: this.userId}, {fields: {userId: 0}});
});

Meteor.methods({
    patch (patch) {
        check(this.userId, String);
        check(patch, {
            created: [String],
            removed: [String],
            updated: Object
        });

        bulkPatch(Proofs, patch, this.userId);
    }
});

function bulkPatch (collection, patch, userId) {
    const idsC = patch.created;
    const idsR = patch.removed;
    const idsU = Object.keys(patch.updated);

    if (!idsC.length && !idsR.length && !idsU.length)
        return;

    const hand = collection.rawCollection();
    const bulk = hand.initializeUnorderedBulkOp();

    idsR.forEach(_id => bulk.find({_id}).remove());
    idsU.forEach(_id => {
        if (!patch.removed[_id]) {
            if (idsC.includes(_id)) {
                bulk.insert(Object.assign({_id, userId}, patch.updated[_id]));
            } else {
                bulk.find({_id}).update({$set: patch.updated[_id]});
            }
        }
    });

    bulk.execute();
}
