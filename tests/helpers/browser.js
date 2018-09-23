// @flow

import puppeteer from 'puppeteer';

const browser = puppeteer.launch({
  args: ['--disable-gpu', '--disable-infobars', '--no-sandbox'],
  headless: false,
  slowMo: 1
});

const page = browser.then(browser => browser.newPage()).then(page => {
  page.on('console', event => {
    // eslint-disable-next-line no-console
    const handle = console[event.type()];
    if (handle) handle('[page]', ...event.args().map(arg => arg.toString()));
  });

  return page;
});

export const getBrowser: () => Promise<$npm$puppeteer$Browser> = () => browser;
export const getPage: () => Promise<$npm$puppeteer$Page> = () => page;

afterAll(() => getBrowser().then(browser => browser.close()));
