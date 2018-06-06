// @flow

import {Transform} from 'stream';

import {Meteor} from 'meteor/meteor';
import {Boilerplate} from 'meteor/boilerplate-generator';

import {optimize as optimizeCSS} from './optimizeCSS';
import {optimize as optimizeHTML} from './optimizeHTML';
import {optimize as optimizeJS} from './optimizeJS';
import {optimize as optimizeStatics} from './optimizeStatics';

export {optimizeCSS, optimizeHTML, optimizeJS, optimizeStatics};

if (process.env.NODE_ENV === 'production') Meteor.startup(optimizeStatics);

const rawToHTML = Boilerplate.prototype.toHTMLStream;
// $FlowFixMe: Weird error.
Boilerplate.prototype.toHTMLStream = function toHTMLStream() {
  return rawToHTML.apply(this, arguments).pipe(
    new Transform({
      async transform(chunk, encoding, callback) {
        callback(null, optimizeHTML(chunk));
      }
    })
  );
};
