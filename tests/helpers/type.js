// @flow

import {getPage} from './browser';

export async function type(selector: string, value: string) {
  const page = await getPage();
  await page.click(selector);
  await page.keyboard.down('Control');
  await page.keyboard.press('A');
  await page.keyboard.up('Control');
  await page.type(selector, value);
}
