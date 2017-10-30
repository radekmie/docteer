// @flow

// $FlowFixMe: No local file.
import {it} from 'meteor/universe:e2e';

import {page} from './_browser';

export function navigate(title: string) {
  it(`should click '${title}' navigation link`, async () => {
    const selector = `.bg-dark-gray.flex.flex-center.flex-column.h-100.near-white.pa3.ph1 > [title="${title}"]`;
    await page.waitForSelector(selector);
    await page.click(selector);
  });
}
