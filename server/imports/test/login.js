// @flow

// $FlowFixMe: No local file.
import {it} from 'meteor/universe:e2e';

import {page} from './_browser';

export function login(user: {email: string, password: string}) {
  it(`should log in as ${user.email}:${user.password}`, async () => {
    await page.click('#email');
    await page.keyboard.down('Control');
    await page.keyboard.down('A');
    await page.keyboard.up('A');
    await page.keyboard.up('Control');
    await page.type(user.email);

    await page.click('#password');
    await page.keyboard.down('Control');
    await page.keyboard.down('A');
    await page.keyboard.up('A');
    await page.keyboard.up('Control');
    await page.type(user.password);

    await page.click('button[title="Log In"]');
  });
}
