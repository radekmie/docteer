// @flow

import {minify} from 'html-minifier';

import {optimize as minifyCSS} from './optimizeCSS';
import {optimize as minifyJS}  from './optimizeJS';

export const optimizeOptions = {collapseWhitespace: true, minifyCSS, minifyJS};
export const optimize = (html: string) =>
  minify(html, optimizeOptions)
    .replace('?meteor_js_resource=true', '')
    .replace(/<link .*?>/, '')
;
