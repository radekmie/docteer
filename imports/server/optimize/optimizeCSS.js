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

function validNodes (node) {
  return node === undefined || validToken(node) || node.nodes && node.nodes.every(token =>
    validNodes(token) ||
        validToken(token)
  );
}

function validToken (node) {
  return (
    node &&
        selectors[node.type] &&
        selectors[node.type].includes(node.name || node.value || node.operator || node.content)
  );
}

const processor = postcss([
  postcss.plugin('filter', () => root => root.walkRules(rule => {
    rule.selectors = rule.selectors.filter(selector => validNodes(parse(selector).nodes[0]));

    if (rule.selectors.length === 0) {
      rule.remove();
    } else {
      rule.selectors = rule.selectors.sort((a, b) => specificity.compare(a, b) || a.localeCompare(b));
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
