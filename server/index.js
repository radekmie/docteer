import {minify} from 'html-minifier';

import {Boilerplate} from 'meteor/boilerplate-generator';
import {Meteor}      from 'meteor/meteor';
import {check}       from 'meteor/check';

import {Proofs} from '/imports/api/proofs';

if (Meteor.isProduction) {
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

Meteor.methods({
    patch (patch) {
        check(patch, {
            created: [String],
            removed: [String],
            updated: Object
        });

        bulkPatch(Proofs, patch);
    }
});

function bulkPatch (collection, patch) {
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
                bulk.insert(Object.assign({_id}, patch.updated[_id]));
            } else {
                bulk.find({_id}).update({$set: patch.updated[_id]});
            }
        }
    });

    bulk.execute();
}
