// @flow

import {it} from 'meteor/universe:e2e';

import {expand} from '../helpers';
import {page} from '../helpers';
import {type} from '../helpers';

import {navigate} from './navigate';

export function userAddSchema(name: string) {
  navigate('settings');

  it(`should create schema '${name}'`, async () => {
    await page.click('[data-test-schema-add]');
    await page.click('[data-test-schema]:last-of-type');
    await page.waitFor(25);
    await type('[data-test-schema]:last-of-type [data-test-schema-name]', name);
  });
}

export function userChangePassword({
  current,
  new1,
  new2
}: {
  current: string,
  new1: string,
  new2: string
}) {
  navigate('settings');

  it(`should change password from ${current} to ${new1}/${new2}`, async () => {
    await expand('Change password');
    await type('#current', current);
    await type('#new1', new1);
    await type('#new2', new2);

    await page.click('[title="Change password"]');
  });
}

export function userLogIn(user: {email: string, password: string}) {
  navigate('login');

  it(`should log in as ${user.email}:${user.password}`, async () => {
    await type('#email', user.email);
    await type('#password', user.password);

    await page.click('[data-test-user="login"]');
  });
}

export function userLogOut() {
  it('should log out', async () => {
    await page.click('[data-test-navigation="logout"]');
  });
}

export function userSignIn(user: {email: string, password: string}) {
  navigate('login');

  it(`should sign in as ${user.email}:${user.password}`, async () => {
    const selector = '[href="/r"]';
    await page.waitForSelector(selector);
    await page.click(selector);

    await type('#email', user.email);
    await type('#password', user.password);

    await page.click('[data-test-user="signin"]');
  });
}
