// @flow

import {expand} from '../helpers';
import {type} from '../helpers';

import {navigate} from './_navigate';

import type {SchemaType} from '@types';

export function userAddSchema(schema: SchemaType<*>) {
  navigate.call(this, 'settings');

  it(`should create schema '${schema.name}'`, async () => {
    const inA = '[data-test-schema]:last-of-type';
    const inB = '[data-test-schema]:last-of-type > :nth-last-child(2)';

    const page = await this.page;
    await page.click('[data-test-schema-add]');
    await page.waitFor(10);
    await page.click(inA);
    await type(page, `${inA} [data-test-schema-name]`, schema.name);
    await page.$eval(
      `${inA} [data-test-schema-name]`,
      /* istanbul ignore next */ input => input.blur()
    );

    for (const [fieldName, fieldType] of Object.entries(schema.fields)) {
      await page.click(`${inA} [data-test-schema-field-add]`);
      await page.select(`${inB} [data-test-schema-field-type]`, fieldType);
      await type(page, `${inB} [data-test-schema-field-name]`, fieldName);
    }
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
  navigate.call(this, 'settings');

  it(`should change password from ${current} to ${new1}/${new2}`, async () => {
    const page = await this.page;
    await expand(page, 'Change password');
    await type(page, '#current', current);
    await type(page, '#new1', new1);
    await type(page, '#new2', new2);
    await page.click('[title="Change password"]');
  });
}

export function userLogIn(user: {email: string, password: string}) {
  navigate.call(this, 'login');

  it(`should log in as ${user.email}:${user.password}`, async () => {
    const selector = '[href="/signup"]';
    const page = await this.page;
    await page.waitForSelector(selector);

    await type(page, '#email', user.email);
    await type(page, '#password', user.password);

    await page.click('[data-test-user="login"]');
  });
}

export function userLogOut() {
  it('should log out', async () => {
    const page = await this.page;
    await page.click('[data-test-navigation="logout"]');
  });
}

export function userSignUp(user: {email: string, password: string}) {
  navigate.call(this, 'login');

  it(`should sign in as ${user.email}:${user.password}`, async () => {
    const selector = '[href="/signup"]';
    const page = await this.page;
    await page.waitFor(100);
    await page.waitForSelector(selector);
    await page.waitFor(100);
    await page.click(selector);
    await page.waitFor(100);
    await page.waitForSelector(selector, {hidden: true});

    await type(page, '#email', user.email);
    await type(page, '#password', user.password);

    await page.click('[data-test-user="signup"]');
  });
}
