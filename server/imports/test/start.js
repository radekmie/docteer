// @flow

import {Meteor} from 'meteor/meteor';
// $FlowFixMe: No local file.
import {it} from 'meteor/universe:e2e';

import {page} from './_browser';

export function start(path: string) {
  it(`should load ${path}`, async () => {
    const url = Meteor.absoluteUrl(path.slice(1));

    await page.goto(url);
    await page.waitForSelector('main:not(.loading)');
    await page.waitFor(25);
  });
}
