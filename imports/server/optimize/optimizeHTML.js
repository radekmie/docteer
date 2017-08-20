import {minify} from 'html-minifier';

import {WebApp} from 'meteor/webapp';

import {optimize as minifyCSS} from './optimizeCSS';
import {optimize as minifyJS}  from './optimizeJS';

WebApp.addHtmlAttributeHook(() => ({lang: 'en'}));

export const optimizeOptions = {collapseWhitespace: true, minifyCSS, minifyJS};
export const optimizeRaw = html =>
    minify(html, optimizeOptions)
        .replace('?meteor_js_resource=true', '')
        .replace(/<link .*?>/, '')
;

export const optimizeCache = {};
export const optimize = js => optimizeCache[js] || (optimizeCache[js] = optimizeRaw(js));
