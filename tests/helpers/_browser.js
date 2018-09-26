// @flow

import puppeteer from 'puppeteer-core';
import {createPool} from 'generic-pool';

const pool = createPool(
  {
    create: () =>
      puppeteer.launch({
        args: ['--disable-gpu', '--disable-infobars', '--no-sandbox'],
        executablePath: 'google-chrome',
        slowMo: 1
      }),
    destroy: browser => browser.close()
  },
  {max: 1}
);

export const getBrowserContext = async () => {
  const browser = await pool.acquire();
  const page = await browser.newPage();
  const release = async () => {
    await page.close();
    await pool.release(browser);
  };

  return {browser, page, release};
};

afterAll(async () => {
  await pool.drain();
  await pool.clear();
});
