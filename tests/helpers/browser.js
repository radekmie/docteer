// @flow

import puppeteer from 'puppeteer';

export let browser: $npm$puppeteer$Browser = null;
export let page: $npm$puppeteer$Page = null;

afterAll(async () => {
  if (browser) await browser.close();
});

beforeAll(async () => {
  browser = await puppeteer.launch({
    args: ['--disable-gpu', '--disable-infobars', '--no-sandbox'],
    headless: false,
    slowMo: 1
  });

  page = await browser.newPage();
  page.on('console', event => {
    // eslint-disable-next-line no-console
    const handle = console[event.type()];
    if (handle) handle('[page]', ...event.args().map(arg => arg.toString()));
  });
});
