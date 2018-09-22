// @flow

import {Transform} from 'stream';

import {Meteor} from 'meteor/meteor';
import {Boilerplate} from 'meteor/boilerplate-generator';

import {optimize as optimizeHTML} from './optimize-html';
import {optimize as optimizeStatics} from './optimize-statics';

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
