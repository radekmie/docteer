// @flow

// $FlowFixMe: No local file.
import {it} from 'meteor/universe:e2e';

import {page} from './_browser';

export function click(selector: string) {
  it(`should click '${selector}'`, async () => {
    await page.waitForSelector(selector);
    await page.click(selector);
  });
}
