import { Page } from 'puppeteer-core';

export async function type(page: Page, selector: string, value: string) {
  await page.click(selector);
  await page.keyboard.down('Control');
  await page.keyboard.press('A');
  await page.keyboard.up('Control');
  await page.type(selector, value);
}
