import UglifyJS        from 'uglify-es';
import autoprefixer    from 'autoprefixer';
import cssnano         from 'cssnano';
import postcss         from 'postcss';
import {minify}        from 'html-minifier';
import {prepackString} from 'prepack/lib/prepack-standalone';
import {readFile}      from 'fs';

import {Accounts}        from 'meteor/accounts-base';
import {Boilerplate}     from 'meteor/boilerplate-generator';
import {Meteor}          from 'meteor/meteor';
import {WebAppInternals} from 'meteor/webapp';
import {check}           from 'meteor/check';

import {Proofs} from '/imports/api/proofs';

if (Meteor.users.find({}, {fields: {_id: 1}, limit: 1}).count() === 0)
    Accounts.createUser({email: 'admin@doctear.com', password: 'doctear'});

if (process.env.NODE_ENV === 'production') {
    const bundledCSSPath = Object.values(WebAppInternals.staticFiles).find(file => file.type === 'css').absolutePath;
    const bundledCSS = Meteor.wrapAsync(readFile)(bundledCSSPath, 'utf8');

    const minifyCSSLib = postcss([
        autoprefixer({browsers: ['last 2 versions']}),
        cssnano({preset: 'default'})
    ]);

    const minifyCSSRaw = css => minifyCSSLib.process(css + bundledCSS).then().await().css;
    const minifyCSSCache = {};
    const minifyCSS = css => minifyCSSCache[css] || (minifyCSSCache[css] = minifyCSSRaw(css));

    const minifyJSRaw = js => UglifyJS.minify(prepackString('unknown', js).code).code
        .replace(',TEST_METADATA:"{}"', '')
        .replace(',autoupdateVersionCordova:"none"', '')
        .replace(/meteorRelease:"METEOR@(.*?)",/, '')
    ;

    const minifyJSCache = {};
    const minifyJS = js => minifyJSCache[js] || (minifyJSCache[js] = minifyJSRaw(js));

    const minifyHTMLOptions = {collapseWhitespace: true, minifyCSS, minifyJS};
    const minifyHTMLRaw = html =>
        minify(html, minifyHTMLOptions)
            .replace('<html>', '<html lang="en">')
            .replace('?meteor_js_resource=true', '')
            .replace(/<link .*?>/, '')
    ;

    const minifyHTMLCache = {};
    const minifyHTML = js => minifyHTMLCache[js] || (minifyHTMLCache[js] = minifyHTMLRaw(js));

    const rawToHTML = Boilerplate.prototype.toHTML;
    Boilerplate.prototype.toHTML = function toHTML () {
        return minifyHTML(rawToHTML.call(this, arguments));
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
