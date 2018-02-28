// @flow

import {prepackSources} from 'prepack/lib/prepack-standalone';
import {readFile} from 'fs';

import {Meteor} from 'meteor/meteor';
import {WebAppInternals} from 'meteor/webapp';
import {meteorJsMinify} from 'meteor/minifier-js';

import {cache} from '../../imports/lib';

const bundledJSFile = Object.keys(WebAppInternals.staticFiles)
  .map(file => WebAppInternals.staticFiles[file])
  .find(file => file.type === 'js');

const bundledJS = bundledJSFile
  ? Meteor.wrapAsync(readFile)(bundledJSFile.absolutePath, 'utf8')
  : '';

if (bundledJSFile && bundledJS)
  bundledJSFile.content = meteorJsMinify(`;(function(){${bundledJS}})();`).code;

export const optimizeOptions = {
  delayInitializations: true,
  inlineExpressions: true
};

export const optimize = cache((js: string) =>
  meteorJsMinify(
    prepackSources([{filePath: 'unknown', fileContents: js}], optimizeOptions)
      .code
  )
    .code.replace(',ROOT_URL_PATH_PREFIX:""', '')
    .replace(',TEST_METADATA:"{}"', '')
    .replace(',autoupdateVersionCordova:"none"', '')
    .replace(/meteorRelease:"METEOR@(.*?)",/, '')
);
