import autoprefixer from 'autoprefixer';
import cssnano      from 'cssnano';
import parse        from 'css-selector-tokenizer/lib/parse';
import postcss      from 'postcss';
import {readFile}   from 'fs';

import {Meteor}          from 'meteor/meteor';
import {WebAppInternals} from 'meteor/webapp';

import selectors from './optimizeCSSData.json';

const bundledCSSPath = Object.values(WebAppInternals.staticFiles).find(file => file.type === 'css').absolutePath;
const bundledCSS = Meteor.wrapAsync(readFile)(bundledCSSPath, 'utf8');

const processor = postcss([
    postcss.plugin('filter', () => root => root.walkRules(rule => {
        rule.selectors = rule.selectors.filter(selector => {
            const parsed = parse(selector).nodes[0];

            if (parsed === undefined) {
                return true;
            }

            return parsed.nodes.some(token =>
                token.name === ':root'   ||
                token.type === 'class'   && selectors.classes.includes(token.name) ||
                token.type === 'id'      && selectors.ids.includes(token.name) ||
                token.type === 'invalid'
            ) || parsed.nodes.every(token =>
                token.type === 'element' && selectors.elements.includes(token.name)
            );
        });
        rule.selectors.length || rule.remove();
    })),
    autoprefixer({browsers: ['last 2 Chrome versions']}),
    cssnano({preset: 'default'})
]);

export const optimizeRaw = css => processor.process(css + bundledCSS).then().await().css;
export const optimizeCache = {};
export const optimize = css => optimizeCache[css] || (optimizeCache[css] = optimizeRaw(css));
