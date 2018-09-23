// @flow

import {it} from 'meteor/universe:e2e';

import {page} from '../helpers';

export function wait(time: number) {
  it(`should wait for ${time}`, async () => {
    await page.waitFor(time);
  });
}
