// @flow

import cssnext from 'postcss-cssnext';
import cssnano from 'cssnano';
import postcss from 'postcss';
import {readFile} from 'fs';

import {Meteor} from 'meteor/meteor';
import {WebAppInternals} from 'meteor/webapp';

import {cache} from '../../imports/lib';

const bundledCSSFile = Object.keys(WebAppInternals.staticFiles)
  .map(file => WebAppInternals.staticFiles[file])
  .find(file => file.type === 'css');

const bundledCSS = bundledCSSFile
  ? Meteor.wrapAsync(readFile)(bundledCSSFile.absolutePath, 'utf8')
  : '';

const processor = postcss([
  cssnext({browsers: ['last 2 major versions']}),
  cssnano({preset: ['advanced', {discardComments: {removeAll: true}}]})
]);

export const optimize = cache(
  (css: string) =>
    processor
      .process(css + bundledCSS, {from: undefined})
      .then()
      .await().css
);
