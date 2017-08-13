import {Boilerplate} from 'meteor/boilerplate-generator';

import {optimize as optimizeCSS}     from './optimizeCSS';
import {optimize as optimizeHTML}    from './optimizeHTML';
import {optimize as optimizeJS}      from './optimizeJS';
import {optimize as optimizeStatics} from './optimizeStatics';

export {
    optimizeCSS,
    optimizeHTML,
    optimizeJS,
    optimizeStatics
};

const rawToHTML = Boilerplate.prototype.toHTML;
Boilerplate.prototype.toHTML = function toHTML () {
    return optimizeHTML(rawToHTML.apply(this, arguments));
};
