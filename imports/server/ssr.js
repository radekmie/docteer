/** @jsx h */

import {h}      from 'preact';
import {render} from 'preact-render-to-string';

import {Boilerplate} from 'meteor/boilerplate-generator';

import {Logo} from '/imports/components/Logo';

const body = render(
    <body>
        <main class="app loading" />
        <Logo />
    </body>
).replace('</body>', '');

const rawToHTML = Boilerplate.prototype.toHTML;
Boilerplate.prototype.toHTML = function toHTML () {
    return rawToHTML.apply(this, arguments).replace('<body>', body);
};
