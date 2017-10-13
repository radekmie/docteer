// @flow
// @jsx h

import {h} from 'preact';
import {render} from 'preact-render-to-string';

import {Boilerplate} from 'meteor/boilerplate-generator';
import {WebApp} from 'meteor/webapp';

import {Application} from '../../imports/components/Application';
import {Logo} from '../../imports/components/Logo';

WebApp.addHtmlAttributeHook(() => ({lang: 'en'}));

const body = render(
  <body>
    <Application />
    <Logo class="center dark-gray fixed" />
  </body>
).slice(0, -7);

const rawToHTML = Boilerplate.prototype.toHTML;
Boilerplate.prototype.toHTML = function toHTML() {
  return rawToHTML.apply(this, arguments).replace('<body>', body);
};
