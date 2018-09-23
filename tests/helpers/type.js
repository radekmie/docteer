// @flow

import {page} from './browser';

export async function type(selector: string, value: string) {
  await page.click(selector);
  await page.keyboard.down('Control');
  await page.keyboard.press('A');
  await page.keyboard.up('Control');
  await page.type(selector, value);
}
