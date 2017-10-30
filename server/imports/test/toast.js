// @flow

// $FlowFixMe: No local file.
import {it} from 'meteor/universe:e2e';

import {page} from './_browser';

export function toast(text: string) {
  it(`should show toast '${text}'`, async () => {
    await page.waitForFunction(
      `Array.from(document.querySelectorAll('main > :last-child > *')).some(x => x.textContent === '${text.replace(
        "'",
        "\\'"
      )}')`,
      {polling: 'mutation'}
    );
  });
}
