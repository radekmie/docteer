// @flow

import {before} from 'meteor/universe:e2e';
// $FlowFixMe: No local file.
import {createBrowser} from 'meteor/universe:e2e';

import type {Browser} from 'puppeteer';
import type {Page} from 'puppeteer';

export let browser: Browser = null;
export let page: Page = null;

before(async () => {
  ({browser, page} = await createBrowser({
    args: ['--disable-gpu', '--disable-infobars', '--no-sandbox'],
    slowMo: 0
  }));
});
