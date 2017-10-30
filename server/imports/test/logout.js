// @flow

// $FlowFixMe: No local file.
import {it} from 'meteor/universe:e2e';

import {page} from './_browser';

export function logout() {
  it('should log out', async () => {
    await page.waitForSelector('[title="Log Out"]');
    await page.click('[title="Log Out"]');
  });
}
