// @flow

import {before} from 'meteor/universe:e2e';
import {createBrowser} from 'meteor/universe:e2e';

// $FlowFixMe: Late initialization.
export let browser: $npm$puppeteer$Browser = null;
// $FlowFixMe: Late initialization.
export let page: $npm$puppeteer$Page = null;

before(async () => {
  ({browser, page} = await createBrowser({
    args: ['--disable-gpu', '--disable-infobars', '--no-sandbox'],
    slowMo: 0
  }));

  page.on('console', event => {
    // eslint-disable-next-line no-console
    console[event.type()]('[page]', ...event.args().map(arg => arg.toString()));
  });
});
