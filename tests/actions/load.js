// @flow

import {getPage} from '../helpers';

export function load(path: string) {
  it(`should load ${path}`, async () => {
    const page = await getPage();
    await page.goto(`http://localhost:3000${path}`);
    await page.waitForSelector('main:not(.hidden)');
  });
}
