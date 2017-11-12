// @flow

import {Meteor} from 'meteor/meteor';
import {it} from 'meteor/universe:e2e';

import {page} from '../helpers';

export function load(path: string) {
  it(`should load ${path}`, async () => {
    const url = Meteor.absoluteUrl(path.slice(1));

    await page.goto(url);
    await page.waitForSelector('main:not(.loading)');
    await page.waitFor(25);
  });
}
