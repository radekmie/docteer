import {minify} from 'html-minifier';

import {Boilerplate} from 'meteor/boilerplate-generator';
import {Meteor}      from 'meteor/meteor';
import {check}       from 'meteor/check';

import {Labels} from '/imports/api/labels';
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
            labels: Object,
            proofs: Object
        });

        const now = Date.now();

        bulkPatch(Labels, patch.labels);
        bulkPatch(Proofs, patch.proofs);

        const elapsed = Date.now() - now;
        const minimum = 2000;

        if (elapsed < minimum)
            Meteor._sleepForMs(minimum - elapsed);
    }
});

function bulkPatch (collection, patch) {
    const keys = Object.keys(patch);
    if (!keys.length)
        return;

    const hand = collection.rawCollection();
    const bulk = hand.initializeUnorderedBulkOp();
    keys.forEach(_id => bulk.find({_id}).update({$set: patch[_id]}));
    bulk.execute();
}
