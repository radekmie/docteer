import UglifyJS        from 'uglify-es';
import autoprefixer    from 'autoprefixer';
import cssnano         from 'cssnano';
import parse           from 'css-selector-tokenizer/lib/parse';
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
    let bundledCSS;

    Object.entries(WebAppInternals.staticFiles).forEach(entry => {
        if (entry[1].type === 'css') {
            bundledCSS = Meteor.wrapAsync(readFile)(entry[1].absolutePath, 'utf8');
        }

        if (entry[1].type !== 'js')
            delete WebAppInternals.staticFiles[entry[0]];
    });

    const selectors = {
        classes: [
            'b--dark-gray',
            'ba',
            'bb',
            'bg-near-white',
            'bg-washed-red',
            'bg-white',
            'blue',
            'bottom-1',
            'br',
            'br-100',
            'bt',
            'bw0',
            'bw1',
            'cf',
            'dark-gray',
            'db',
            'f4',
            'filler',
            'fixed',
            'fl',
            'flex',
            'flex-auto',
            'flex-column',
            'fr',
            'gray',
            'green',
            'h-100',
            'h2',
            'hover-blue',
            'hover-dark-blue',
            'hover-dark-pink',
            'hover-gray',
            'hover-green',
            'hover-light-blue',
            'hover-light-gray',
            'hover-light-green',
            'hover-light-red',
            'hover-red',
            'lh-copy',
            'link',
            'list',
            'loading',
            'ma0',
            'ma1',
            'mb1',
            'ml1',
            'mr2',
            'mt3',
            'mv0',
            'near-white',
            'overflow-auto',
            'pa1',
            'pa3',
            'pa4',
            'ph1',
            'ph3',
            'pl0',
            'pl4',
            'pointer',
            'pr3',
            'pt1',
            'pv3',
            'red',
            'right-1',
            'sans-serif',
            'tc',
            'v-mid',
            'w-100',
            'w-20',
            'w-30',
            'w-50',
            'w-75',
            'w2',
            'w3'
        ],

        elements: [
            'a',
            'b',
            'body',
            'button',
            'code',
            'dd',
            'div',
            'dl',
            'dt',
            'form',
            'h1',
            'header',
            'html',
            'input',
            'label',
            'li',
            'main',
            'path',
            'section',
            'span',
            'svg',
            'to',
            'ul'
        ],

        ids: [
            'app',
            'loader'
        ]
    };

    const minifyCSSLib = postcss([
        postcss.plugin('filter', () => root => root.walkRules(rule => {
            rule.selectors = rule.selectors.filter(selector => {
                const parsed = parse(selector).nodes[0];
                if (parsed === undefined)
                    return true;

                return parsed.nodes.some(token =>
                    token.name === ':root'   ||
                    token.type === 'class'   && selectors.classes.includes(token.name) ||
                    token.type === 'element' && selectors.elements.includes(token.name) ||
                    token.type === 'id'      && selectors.ids.includes(token.name) ||
                    token.type === 'invalid'
                );
            });
            rule.selectors.length || rule.remove();
        })),
        autoprefixer({browsers: ['last 2 Chrome versions']}),
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
