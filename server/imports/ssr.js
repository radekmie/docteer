// @flow
// @jsx h

import {h} from 'preact';
import {render} from 'preact-render-to-string';

import {WebAppInternals} from 'meteor/webapp';
import {WebApp} from 'meteor/webapp';

import {Application} from '../../imports/components/Application';
import {Logo} from '../../imports/components/Logo';
import {cache} from '../../imports/lib';
import {titleForView} from '../../imports/lib';

const ssr = cache(view => ({
  dynamicBody: render(
    <body>
      <Application view={view} />
      <Logo class="center dark-gray fixed" />
    </body>
  ).slice(6, -7),

  dynamicHead: `<title>${titleForView(
    view
  )} | DocTeer</title><style>/* _ */</style>`
}));

WebApp.addHtmlAttributeHook(() => ({lang: 'en'}));
WebAppInternals.registerBoilerplateDataCallback('SSR', (request, data) => {
  let view = request.url.pathname.slice(1, 2);
  if (!['l', 'r'].includes(view)) view = '';

  Object.assign(data, ssr(view));
});
