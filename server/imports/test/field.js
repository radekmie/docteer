// @flow

import assert from 'assert';

// $FlowFixMe: No local file.
import {it} from 'meteor/universe:e2e';

import {page} from './_browser';

export function field(
  position: number,
  name: string,
  value: string | string[],
  {useAutocomplete = false}: {useAutocomplete: boolean} = {}
) {
  if (name !== 'Labels' && useAutocomplete)
    throw new Error('Autocomplete works only with labels.');

  it(`should check field ${position + 1} to be called '${name}'`, async () => {
    await page.waitForFunction(
      `(document.querySelector('dl > dt:nth-of-type(${position +
        1}) > b') || {}).textContent === '${name}:'`,
      {polling: 'mutation'}
    );
  });

  it(`should enter field ${position + 1} value${
    useAutocomplete ? ' with autocomplete' : ''
  }`, async () => {
    const selector = `dl > dd:nth-of-type(${position + 1}) > :first-child`;

    await page.click(selector);
    await page.keyboard.down('Control');
    await page.keyboard.down('A');
    await page.keyboard.up('A');
    await page.keyboard.up('Control');

    value = [].concat(value);

    const input = value.slice();

    if (useAutocomplete) {
      await page.keyboard.type(input.shift()[0]);
      await page.keyboard.press('ArrowRight');
    } else {
      await page.keyboard.type(input.shift());
    }

    while (input.length) {
      // FIXME: It's not working in contenteditable.
      // await page.keyboard.press('Enter');
      await page.$eval(selector, input => (input.innerHTML += '<li></li>'));
      await page.keyboard.press('PageDown');

      if (useAutocomplete) {
        await page.keyboard.type(input.shift()[0]);
        await page.keyboard.press('ArrowRight');
      } else {
        await page.keyboard.type(input.shift());
      }
    }

    const unify = string => string.replace(/[\n\r]/g, '').replace(/\s/g, ' ');

    assert.equal(
      unify(value.join('')),
      unify(await page.$eval(selector, input => input.textContent))
    );

    await page.$eval(selector, input => input.blur());
  });
}
