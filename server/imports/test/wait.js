// @flow

// $FlowFixMe: No local file.
import {it} from 'meteor/universe:e2e';

import {page} from './_browser';

export function wait(time: number) {
  it(`should wait ${time}ms`, async () => {
    await page.waitFor(time);
  });
}
