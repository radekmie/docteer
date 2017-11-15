// @flow

import assert from 'assert';

import {it} from 'meteor/universe:e2e';

import {page} from '../helpers';
import {type} from '../helpers';

export function noteAction(title: string) {
  it(`should perform '${title}' notes action`, async () => {
    const selector = `[data-test-notes-action="${title}"]`;
    await page.waitForSelector(selector);
    await page.click(selector);
  });
}

export function noteCheck(title: string, color: string = 'normal') {
  const selector = `[data-test-note="${title}"]`;

  if (color === '-') {
    it(`should check if note called '${title}' is not visible`, async () => {
      await page.waitForSelector(selector, {hidden: true});
      await page.waitForSelector(selector, {hidden: true});
    });

    return;
  }

  it(`should check if note called '${title}' is visible`, async () => {
    await page.waitForSelector(selector);
    await page.hover(selector);
  });

  it(`should check if note called '${title}' is ${color}`, async () => {
    const type = color === 'normal' ? 'dark-gray' : `hover-${color}`;
    await page.waitForSelector(`.${type}${selector}`);
  });
}

export function noteField(
  position: number,
  name: string,
  value: string | string[],
  {useAutocomplete = false}: {useAutocomplete: boolean} = {}
) {
  if (name !== 'Labels' && useAutocomplete)
    throw new Error('Autocomplete works only with labels.');

  it(`should check field ${position + 1} to be called '${name}'`, async () => {
    const part = `:nth-of-type(${position + 1})[data-test-note-`;
    await page.waitForSelector(`dt${part}label="${name}"]`);
    await page.waitForSelector(`dd${part}field="${name}"]`);
  });

  it(`should enter field ${position + 1} value${
    useAutocomplete ? ' with autocomplete' : ''
  }`, async () => {
    const selector = `[data-test-note-field="${name}"] > :first-child`;

    await type(selector, '');

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

export function noteSchema(name: string) {
  it(`should select schema '${name}'`, async () => {
    await page.waitForSelector('[data-test-note-schema]');
    await page.select('[data-test-note-schema]', name);
  });
}

export function noteSelect(title: string) {
  it(`should select note called '${title}'`, async () => {
    await page.click(`[data-test-note="${title}"]`);
  });
}
