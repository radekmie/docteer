// @flow

import {Transform} from 'stream';

import {Boilerplate} from 'meteor/boilerplate-generator';

import {optimize as optimizeCSS} from './optimizeCSS';
import {optimize as optimizeHTML} from './optimizeHTML';
import {optimize as optimizeJS} from './optimizeJS';
import {optimize as optimizeStatics} from './optimizeStatics';

export {optimizeCSS, optimizeHTML, optimizeJS, optimizeStatics};

if (process.env.NODE_ENV === 'production') optimizeStatics();

const rawToHTML = Boilerplate.prototype.toHTML;
Boilerplate.prototype.toHTML = function toHTML() {
  return rawToHTML.apply(this, arguments).pipe(
    new Transform({
      async transform(chunk, encoding, callback) {
        callback(null, optimizeHTML(chunk));
      }
    })
  );
};
