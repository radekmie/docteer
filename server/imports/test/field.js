// @flow

// $FlowFixMe: No local file.
import {it} from 'meteor/universe:e2e';

import {page} from './_browser';

export function field(
  position: number,
  name: string,
  value: string | string[]
) {
  it(`should check field ${position + 1} to be called '${name}'`, async () => {
    await page.waitForFunction(
      `(document.querySelector('dl > dt:nth-of-type(${position +
        1}) > b') || {}).textContent === '${name}:'`,
      {polling: 'mutation'}
    );
  });

  it(`should enter field ${position + 1} value`, async () => {
    const selector = `dl > dd:nth-of-type(${position + 1}) > :first-child`;

    await page.click(selector);
    await page.keyboard.down('Control');
    await page.keyboard.down('A');
    await page.keyboard.up('A');
    await page.keyboard.up('Control');

    value = [].concat(value);

    await page.keyboard.type(value.shift());

    while (value.length) {
      // FIXME: It's not working in contenteditable.
      // await page.keyboard.press('Enter');
      await page.$eval(selector, input => (input.innerHTML += '<li></li>'));
      await page.keyboard.press('PageDown');
      await page.keyboard.type(value.shift());
    }

    await page.$eval(selector, input => input.blur());
  });
}
