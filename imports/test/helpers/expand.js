// @flow

import {page} from './browser';

export async function expand(title: string) {
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
}
