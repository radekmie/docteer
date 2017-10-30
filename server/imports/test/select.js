// @flow

// $FlowFixMe: No local file.
import {it} from 'meteor/universe:e2e';

import {page} from './_browser';

export function select(title: string) {
  it(`should select note called '${title}'`, async () => {
    const note = await page.evaluate(
      `Array.from(document.querySelectorAll('.b--dark-gray.bl > *')).findIndex(x => x.textContent === '${title.replace(
        "'",
        "\\'"
      )}')`
    );
    await page.click(`.b--dark-gray.bl > :nth-child(${note + 1})`);
  });
}
