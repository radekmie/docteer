// @flow

import {readFile} from 'fs';

import {Meteor} from 'meteor/meteor';
import {WebAppInternals} from 'meteor/webapp';
import {meteorJsMinify} from 'meteor/minifier-js';

import {optimize as minifyCSS} from './optimize-css';

const readFileSync = Meteor.wrapAsync(readFile);

export const optimizeOptions = {
  allowed: ['asset', 'css', 'js'],
  minify: {
    css: minifyCSS,
    js: js => meteorJsMinify(`(function(){${js}})()`).code
  }
};

export const optimize = () => {
  // NOTE: This package requires manifest.json.
  if (global.Package['bundle-visualizer']) return;

  for (const staticFiles of Object.values(WebAppInternals.staticFilesByArch)) {
    for (const [path, file] of Object.entries(staticFiles)) {
      if (!optimizeOptions.allowed.includes(file.type)) {
        delete staticFiles[path];
        break;
      }

      if (file.type in optimizeOptions.minify) {
        const source = readFileSync(file.absolutePath, 'utf8');
        const minified = optimizeOptions.minify[file.type](source);

        file.content = minified;
      }
    }
  }
};
