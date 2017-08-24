import autoprefixer from 'autoprefixer';
import cssnano      from 'cssnano';
import parse        from 'css-selector-tokenizer/lib/parse';
import postcss      from 'postcss';
import specificity  from 'specificity';
import {readFile}   from 'fs';

import {Meteor}          from 'meteor/meteor';
import {WebAppInternals} from 'meteor/webapp';

import selectors from './optimizeCSSData.json';

const bundledCSSPath = Object
    .keys(WebAppInternals.staticFiles)
    .map(file => WebAppInternals.staticFiles[file])
    .find(file => file.type === 'css')
    .absolutePath
;

const bundledCSS = Meteor.wrapAsync(readFile)(bundledCSSPath, 'utf8');

const processor = postcss([
    postcss.plugin('filter', () => root => root.walkRules(rule => {
        rule.selectors = rule.selectors.filter(selector => {
            const parsed = parse(selector).nodes[0];

            if (parsed === undefined) {
                return true;
            }

            return (
                parsed.nodes .some(token => token.type === 'class'   && selectors.classes .includes(token.name) || token.type === 'invalid') ||
                parsed.nodes.every(token => token.type === 'element' && selectors.elements.includes(token.name))
            );
        });

        if (rule.selectors.length === 0) {
            rule.remove();
        } else {
            rule.selectors = rule.selectors.sort();
        }
    })),
    postcss.plugin('merger', () => root => root.walkRules(rule => {
        if (rule.selector === '') {
            return;
        }

        root.walkRules(rule.selector, same => {
            if (rule === same) {
                return;
            }

            rule.append(same.nodes);
            same.remove();
        });
    })),
    postcss.plugin('sorter', () => root => root.walkRules(rule => {
        if (rule.selector === '') {
            return;
        }

        rule.nodes.sort((a, b) => a.prop.localeCompare(b.prop));
    })),
    autoprefixer({browsers: ['last 2 Chrome versions']}),
    cssnano({preset: 'advanced'}),
    postcss.plugin('tweaks', () => root => root.nodes.sort((a, b) =>
        a.type.localeCompare(b.type) || (!a.selector || !b.selector ? 0 : specificity.compare(a.selectors[0], b.selectors[0]) || a.selector.localeCompare(b.selector))
    ))
]);

export const optimize = css => processor.process(css + bundledCSS).then().await().css;
