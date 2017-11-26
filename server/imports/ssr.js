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
      'content-security-policy': [
        "default-src 'none'; ",
        'connect-src *; ',
        'img-src *; ',
        "script-src 'self' 'unsafe-inline'; ",
        "style-src 'self' 'unsafe-inline';"
      ].join(''),
      'referrer-policy': 'no-referrer',
      'x-frame-options': 'sameorigin',
      'x-ua-compatible': 'IE=edge',
      'x-xss-protection': '1; mode=block',
      etag: etag(`${Date.now()}${dynamicBody}`)
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
