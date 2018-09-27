// @flow

// $FlowFixMe: Puppeteer typings.
export async function type(page: any, selector: string, value: string) {
  await page.click(selector);
  await page.keyboard.down('Control');
  await page.keyboard.press('A');
  await page.keyboard.up('Control');
  await page.type(selector, value);
}
