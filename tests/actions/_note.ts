import assert from 'assert';

import { type } from '../helpers';
import { BrowserContext } from './_browser';

export function noteAction(this: BrowserContext, title: string) {
  it(`should perform '${title}' notes action`, async () => {
    const page = await this.page;
    await page.click(`[data-test-notes-action="${title}"]`);
  });
}

export function noteCheck(
  this: BrowserContext,
  title: string,
  color = 'normal',
) {
  const selector = `[data-test-note="${title}"]`;

  if (color === '-') {
    it(`should check if note called '${title}' is not visible`, async () => {
      const page = await this.page;
      await page.waitForSelector(selector, { state: 'hidden' });
    });

    return;
  }

  it(`should check if note called '${title}' is visible`, async () => {
    const page = await this.page;
    await page.hover(selector);
  });

  it(`should check if note called '${title}' is ${color}`, async () => {
    const type = color === 'normal' ? 'dark-gray' : `hover-${color}`;
    const page = await this.page;
    await page.waitForSelector(`.${type}${selector}`);
  });
}

export function noteField(
  this: BrowserContext,
  position: number,
  name: string,
  value: string | string[],
  { useAutocomplete = false }: { useAutocomplete?: boolean } = {},
) {
  if (name !== 'Labels' && useAutocomplete) {
    throw new Error('Autocomplete works only with labels.');
  }

  it(`should check field ${position + 1} to be called '${name}'`, async () => {
    const part = `:nth-of-type(${position + 1})[data-test-note-`;
    const page = await this.page;
    await page.waitForSelector(`dt${part}label="${name}"]`);
    await page.waitForSelector(`dd${part}field="${name}"]`);
  });

  it(`should enter field ${position + 1} value${
    useAutocomplete ? ' with autocomplete' : ''
  }`, async () => {
    const selector = `[data-test-note-field="${name}"] > :first-child`;
    const page = await this.page;
    await type(page, selector, '');
    value = Array.isArray(value) ? value : [value];

    const input = value.slice();

    if (useAutocomplete) {
      await page.keyboard.type(input.shift()![0]);
      await page.keyboard.press('ArrowRight');
    } else {
      await page.keyboard.type(input.shift()!);
    }

    while (input.length) {
      // FIXME: It's not working in contenteditable.
      // await page.keyboard.press('Enter');

      await page.$eval(
        selector,
        /* istanbul ignore next */
        input => (input.innerHTML += '<li></li>'),
      );
      await page.keyboard.press('PageDown');

      if (useAutocomplete) {
        await page.keyboard.type(input.shift()![0]);
        await page.keyboard.press('ArrowRight');
      } else {
        await page.keyboard.type(input.shift()!);
      }
    }

    await page.$eval(
      selector,
      /* istanbul ignore next */
      input => input.blur(),
    );

    const unify = (string: string) =>
      string.replace(/[\n\r]/g, '').replace(/\s/g, ' ');

    assert.equal(
      unify(value.join('')),
      unify(
        await page.$eval(
          selector,
          /* istanbul ignore next */
          input => input.textContent!,
        ),
      ),
    );
  });
}

export function noteSchema(this: BrowserContext, name: string) {
  it(`should select schema '${name}'`, async () => {
    const page = await this.page;
    await page.selectOption('[data-test-note-schema]', name);
  });
}

export function noteSelect(this: BrowserContext, title: string) {
  it(`should select note called '${title}'`, async () => {
    const page = await this.page;
    await page.click(`[data-test-note="${title}"]`);
  });
}
