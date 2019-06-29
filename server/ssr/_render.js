// @flow
// @jsx h

import cheerio from 'cheerio';
import etag from 'etag';
import path from 'path';
import fs from 'fs';
import {h} from 'preact';
import {render as preact} from 'preact-render-to-string';

import {Application} from '@client/components/Application';
import {Logo} from '@client/components/Logo';
import {cache, titleForView} from '@shared';

export const params = (url: string) => {
  const view = url.split('/', 3)[1];
  return view !== 'login' && view !== 'signup' ? '' : view;
};

export const render = cache<string, _>(view => {
  const $html = cheerio.load(template());
  $html('body')
    .prepend(preact(<Logo class="center dark-gray fixed" />))
    .prepend(preact(<Application view={view} />));
  $html('head')
    .append(preact(<title>{titleForView(view)} | DocTeer</title>))
    .append(preact(<link rel="manifest" href="/manifest.webmanifest" />));

  const body = $html.html();

  return {
    body,
    headers: {
      // FIXME: Get all needed.
      // 'content-security-policy': [
      //   "default-src 'none'; ",
      //   'connect-src ws:; ',
      //   'img-src * data:; ',
      //   "script-src 'self' 'unsafe-inline'; ",
      //   "style-src 'self' 'unsafe-inline';"
      // ].join(''),
      'content-type': 'text/html',
      'referrer-policy': 'no-referrer',
      'x-frame-options': 'sameorigin',
      'x-ua-compatible': 'IE=edge',
      'x-xss-protection': '1; mode=block',
      etag: etag(`${Date.now()}${body}`)
    }
  };
});

export const template = cache<void, string>(() =>
  fs.readFileSync(path.join(__dirname, '..', 'client', 'index.html')).toString()
);
