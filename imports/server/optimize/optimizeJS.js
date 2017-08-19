import {prepackString} from 'prepack/lib/prepack-standalone';

import {meteorJsMinify} from 'meteor/minifier-js';

export const optimizeRaw = js =>
    meteorJsMinify(prepackString('unknown', js).code).code
        .replace(',TEST_METADATA:"{}"', '')
        .replace(',autoupdateVersionCordova:"none"', '')
        .replace(/meteorRelease:"METEOR@(.*?)",/, '')
;

export const optimizeCache = {};
export const optimize = js => optimizeCache[js] || (optimizeCache[js] = optimizeRaw(js));
