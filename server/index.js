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
    create () {
        return Proofs.insert({expect: '', labels: [], name: '', steps: [], target: ''});
    },

    patch (patch) {
        check(patch, Object);
        bulkPatch(Proofs, patch);
    },

    remove (_id) {
        check(_id, String);
        Proofs.remove({_id});
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
