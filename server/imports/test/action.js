// @flow

// $FlowFixMe: No local file.
import {it} from 'meteor/universe:e2e';

import {page} from './_browser';

export function action(title: string) {
  it(`should click '${title}' action button`, async () => {
    const selector = `.bottom-1.fixed.right-1.w2 > [title=${title}]`;
    await page.waitForSelector(selector);
    await page.click(selector);
  });
}
