// @flow

import {Meteor} from 'meteor/meteor';
import {after} from 'meteor/universe:e2e';

import {page} from '../helpers';

after(async () => {
  await page.evaluate(exportCoverage);
});

export function coverage() {
  after(async () => {
    await page.evaluate(sendCoverage);
  });
}

/* istanbul ignore next */
function exportCoverage() {
  return new Promise((resolve, reject) => {
    // $FlowFixMe: It's added by a package.
    Meteor.exportCoverage('html', error => {
      if (error) reject(error);
      else resolve();
    });
  });
}

/* istanbul ignore next */
function sendCoverage() {
  return new Promise(resolve => {
    // $FlowFixMe: It's added by a package.
    Meteor.sendCoverage(stats => {
      resolve(stats);
    });
  });
}
