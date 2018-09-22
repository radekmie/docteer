// @flow

import {minify} from 'html-minifier';

import {cache} from '../../imports/lib';
import {optimize as minifyCSS} from './optimize-css';
import {optimize as minifyJS} from './optimize-js';

export const optimizeOptions = {collapseWhitespace: true, minifyCSS, minifyJS};
export const optimize = cache((html: Buffer) =>
  Buffer.from(
    minify(html.toString(), optimizeOptions)
      .replace('?meteor_js_resource=true', '')
      .replace(/<link.*?rel=['"]stylesheet['"].*?>/, '')
  )
);
