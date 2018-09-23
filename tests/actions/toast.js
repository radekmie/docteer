// @flow

import {getPage} from '../helpers';

export function toastCheck(text: string) {
  it(`should show toast '${text}'`, async () => {
    const page = await getPage();
    await page.waitForSelector(`[data-test-toast="${text}"]`);
    await page.waitForSelector('[data-test-toasts]');
  });
}
