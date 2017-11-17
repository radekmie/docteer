// @flow

import {after} from 'meteor/universe:e2e';
import {before} from 'meteor/universe:e2e';

import {page} from '../helpers';

const id = x => x.styleSheetId.split('.', 2)[0];

before(() => {
  page._rulesUsages = new Map();
  page._stylesheets = new Map();

  page._client.on('CSS.styleSheetAdded', async ({header}) => {
    if (!page._stylesheets.has(id(header))) {
      page._stylesheets.set(id(header), header);
      Object.assign(
        header,
        await page._client.send('CSS.getStyleSheetText', {
          styleSheetId: header.styleSheetId
        })
      );
    }
  });
});

after(() => {
  page._stylesheets.forEach((stylesheet, key) => {
    const ranged = Array.from({length: stylesheet.length}, (_, index) => index);
    const unused = new Set(ranged);
    const usages = page._rulesUsages.get(key) || [];

    usages.forEach(usage => {
      for (let index = usage.startOffset; index <= usage.endOffset; ++index)
        unused.delete(index);
    });

    const ranges = [[0, 0]];

    unused.forEach(index => {
      if (ranges[ranges.length - 1][1] === index - 1) {
        ++ranges[ranges.length - 1][1];
      } else {
        ranges.push([index, index]);
      }
    });

    const total = ranges.reduce((a, b) => a + b[1] - b[0], 0);
    const cover = (100 * total / stylesheet.length).toFixed(2);

    // eslint-disable-next-line no-console
    console.log(`${stylesheet.sourceURL}: ${cover}%`);
    ranges.forEach(([a, b]) => {
      if (a - b)
        // eslint-disable-next-line no-console
        console.log(`  [${a}-${b}]`, stylesheet.text.substring(a - 1, b + 1));
    });
  });
});

export function statsCSS() {
  before(async () => {
    await page._client.send('Page.enable');
    await page._client.send('DOM.enable');
    await page._client.send('CSS.enable');
    await page._client.send('CSS.startRuleUsageTracking');
  });

  after(async () => {
    const {ruleUsage} = await page._client.send('CSS.stopRuleUsageTracking');

    ruleUsage.forEach(rule => {
      if (!page._rulesUsages.has(id(rule))) page._rulesUsages.set(id(rule), []);
      page._rulesUsages.get(id(rule)).push(rule);
    });
  });
}
