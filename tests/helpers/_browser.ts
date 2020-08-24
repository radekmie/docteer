import { createPool } from 'generic-pool';
import { chromium } from 'playwright';

const pool = createPool(
  { create: () => chromium.launch(), destroy: browser => browser.close() },
  { max: 1 },
);

export const getBrowserContext = async () => {
  const browser = await pool.acquire();
  const page = await browser.newPage();
  const release = async () => {
    await page.close();
    await pool.release(browser);
  };

  return { browser, page, release };
};

afterAll(async () => {
  await pool.drain();
  await pool.clear();
});
