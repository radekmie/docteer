import cheerio from 'cheerio';
import etag from 'etag';
import fs from 'fs';
import path from 'path';
import { h } from 'preact';
import { render as preact } from 'preact-render-to-string';

import { Application } from '../../../client/components/Application';
import { Logo } from '../../../client/components/Logo';
import { cache, titleForView } from '../../../shared';

export const render = cache(view => {
  const $html = cheerio.load(template());
  $html('body')
    .prepend(preact(<Logo className="center dark-gray fixed" />))
    .prepend(preact(<Application view={view} />));
  $html('head')
    .append(preact(<title>{titleForView(view)} | DocTeer</title>))
    .append(preact(<link rel="manifest" href="/manifest.webmanifest" />));

  const body = $html.html();

  return {
    body,
    headers: {
      'content-security-policy': [
        "default-src 'none'",
        "connect-src 'self'",
        'img-src * data:',
        "manifest-src 'self'",
        "script-src 'self'",
        "style-src 'unsafe-inline'",
      ].join(';'),
      'content-type': 'text/html',
      'referrer-policy': 'no-referrer',
      'x-frame-options': 'sameorigin',
      'x-ua-compatible': 'IE=edge',
      'x-xss-protection': '1; mode=block',
      etag: etag(`${Date.now()}${body}`),
    },
  };
});

export const template = cache(() =>
  fs
    .readFileSync(path.join(__dirname, '..', 'client', 'index.html'))
    .toString(),
);
