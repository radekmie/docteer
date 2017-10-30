// @flow

// $FlowFixMe: No local file.
import {it} from 'meteor/universe:e2e';

import {page} from './_browser';

export function expand(title: string) {
  it(`should expand section '${title}'`, async () => {
    await page.waitForFunction(
      `Array.from(document.querySelectorAll('summary')).some(x => x.textContent === '${title.replace(
        "'",
        "\\'"
      )}')`,
      {polling: 'mutation'}
    );

    const summaries = await page.$$('summary');
    const summary = await page.evaluate(
      `Array.from(document.querySelectorAll('summary')).findIndex(x => x.textContent === '${title.replace(
        "'",
        "\\'"
      )}')`
    );

    await summaries[summary].click();
  });
}
