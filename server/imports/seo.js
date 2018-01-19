// @flow

import etag from 'etag';

import {WebAppInternals} from 'meteor/webapp';

const manifest = JSON.stringify({
  name: 'DocTeer',
  short_name: 'DocTeer',
  description:
    'A simple way to store everything. With DocTeer your data are easier to use.',
  start_url: '.',
  display: 'standalone',
  background_color: '#fff',
  theme_color: '#fff'
});

WebAppInternals.staticFiles['/manifest.webmanifest'] = {
  absolutePath: '/manifest.webmanifest',
  cacheable: false,
  content: manifest,
  hash: etag(`${Date.now()}${manifest}`),
  type: 'json'
};
