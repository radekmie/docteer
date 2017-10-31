// @flow

// $FlowFixMe: No local file.
import {it} from 'meteor/universe:e2e';

import {page} from './_browser';

export function signin(user: {email: string, password: string}) {
  it(`should sign in as ${user.email}:${user.password}`, async () => {
    await page.click('#email');
    await page.keyboard.down('Control');
    await page.keyboard.down('A');
    await page.keyboard.up('A');
    await page.keyboard.up('Control');
    await page.keyboard.type(user.email);

    await page.click('#password');
    await page.keyboard.down('Control');
    await page.keyboard.down('A');
    await page.keyboard.up('A');
    await page.keyboard.up('Control');
    await page.keyboard.type(user.password);

    await page.click('button[title="Sign In"]');
  });
}
