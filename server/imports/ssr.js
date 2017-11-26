// @flow
// @jsx h

import etag from 'etag';
import {h} from 'preact';
import {render} from 'preact-render-to-string';

import {WebAppInternals} from 'meteor/webapp';
import {WebApp} from 'meteor/webapp';

import {Application} from '../../imports/components/Application';
import {Logo} from '../../imports/components/Logo';
import {cache} from '../../imports/lib';
import {titleForView} from '../../imports/lib';

const ssr = cache(view => {
  const dynamicBody = render(
    <body>
      <Application view={view} />
      <Logo class="center dark-gray fixed" />
    </body>
  ).slice(6, -7);

  const dynamicHead = [
    `<title>${titleForView(view)} | DocTeer</title>`,
    '<style>/* _ */</style>'
  ].join('');

  return {
    dynamicBody,
    dynamicHead,
    headers: {
      etag: etag(`${Date.now()}${dynamicBody}`),
      'x-ua-compatible': 'IE=edge,chrome=1'
    }
  };
});

WebApp.addHtmlAttributeHook(() => ({lang: 'en'}));
WebApp.rawConnectHandlers.stack.unshift({
  route: '',
  handle(req, res, next) {
    res.setHeader('x-content-type-options', 'nosniff');
    next();
  }
});

WebAppInternals.registerBoilerplateDataCallback('SSR', (req, data) => {
  let view = req.url.pathname.slice(1, 2);
  if (!['l', 'r'].includes(view)) view = '';

  Object.assign(data, ssr(view));

  if (data.headers.etag === req.headers['if-none-match']) {
    data.statusCode = 304;
  }
});
