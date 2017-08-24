import {prepackString} from 'prepack/lib/prepack-standalone';

import {meteorJsMinify} from 'meteor/minifier-js';

export const optimize = js =>
    meteorJsMinify(prepackString('unknown', js).code).code
        .replace(',TEST_METADATA:"{}"', '')
        .replace(',autoupdateVersionCordova:"none"', '')
        .replace(/meteorRelease:"METEOR@(.*?)",/, '')
;
