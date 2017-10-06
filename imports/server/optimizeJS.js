// @flow

import {prepackSources} from 'prepack/lib/prepack-standalone';

import {meteorJsMinify} from 'meteor/minifier-js';

export const optimizeOptions = {
  delayInitializations: true,
  inlineExpressions: true
};
export const optimize = (js: string) =>
  meteorJsMinify(
    prepackSources([{filePath: 'unknown', fileContents: js}], optimizeOptions)
      .code
  )
    .code.replace(',ROOT_URL_PATH_PREFIX:""', '')
    .replace(',TEST_METADATA:"{}"', '')
    .replace(',autoupdateVersionCordova:"none"', '')
    .replace(/meteorRelease:"METEOR@(.*?)",/, '');
