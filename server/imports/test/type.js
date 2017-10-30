// @flow

// $FlowFixMe: No local file.
import {it} from 'meteor/universe:e2e';

import {page} from './_browser';

export function type(selector: string, text: string) {
  it(`should type '${text}' in '${selector}'`, async () => {
    await page.click(selector);
    await page.type(text);
  });
}
