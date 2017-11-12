// @flow

import {it} from 'meteor/universe:e2e';

import {page} from '../helpers';

export function navigate(title: string) {
  it(`should navigate to '${title}'`, async () => {
    const selector = `[data-test-navigation="${title}"]`;
    await page.waitForSelector(selector);
    await page.click(selector);
  });
}
