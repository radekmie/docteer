// @flow

import {page} from '../helpers';

export function toastCheck(text: string) {
  it(`should show toast '${text}'`, async () => {
    await page.waitForSelector(`[data-test-toast="${text}"]`);
    await page.waitForSelector('[data-test-toasts]');
  });
}
