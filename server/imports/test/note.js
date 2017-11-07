// @flow

// $FlowFixMe: No local file.
import {it} from 'meteor/universe:e2e';

import {page} from './_browser';

export function note(title: string, color: string = 'normal') {
  if (color === '-') {
    it(`should check if note called '${title}' is not visible`, async () => {
      await page.waitForFunction(
        `Array.from(document.querySelectorAll('.b--dark-gray.bl > *')).every(x => x.textContent !== '${title.replace(
          "'",
          "\\'"
        )}')`,
        {polling: 'mutation'}
      );
    });

    return;
  }

  it(`should check if note called '${title}' is visible`, async () => {
    await page.waitForFunction(
      `Array.from(document.querySelectorAll('.b--dark-gray.bl > *')).some(x => x.textContent === '${title.replace(
        "'",
        "\\'"
      )}')`,
      {polling: 'mutation'}
    );
  });

  it(`should check if note called '${title}' is ${color}`, async () => {
    await page.waitForFunction(
      `Array.from(document.querySelectorAll('.b--dark-gray.bl > .${
        color === 'normal' ? 'dark-gray' : `hover-${color}`
      }')).some(x => x.textContent === '${title.replace("'", "\\'")}')`,
      {polling: 'mutation'}
    );
  });
}
