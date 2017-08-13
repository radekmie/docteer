import UglifyJS        from 'uglify-es';
import {prepackString} from 'prepack/lib/prepack-standalone';

export const optimizeRaw = js => UglifyJS.minify(prepackString('unknown', js).code).code
    .replace(',TEST_METADATA:"{}"', '')
    .replace(',autoupdateVersionCordova:"none"', '')
    .replace(/meteorRelease:"METEOR@(.*?)",/, '')
;

export const optimizeCache = {};
export const optimize = js => optimizeCache[js] || (optimizeCache[js] = optimizeRaw(js));
