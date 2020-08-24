import { SchemaType } from '../../types';
import { type } from '../helpers';
import { BrowserContext } from './_browser';
import { navigate } from './_navigate';

export function userAddSchema(this: BrowserContext, schema: SchemaType) {
  navigate.call(this, 'settings');

  it(`should create schema '${schema.name}'`, async () => {
    const inA = '[data-test-schema]:last-of-type ';
    const inB = `${inA}> :nth-last-child(2) `;
    const page = await this.page;
    await page.click('[data-test-schema-add]');
    await page.click(`${inA}summary`);
    await type(page, `${inA}[data-test-schema-name]`, schema.name);
    await page.$eval(
      `${inA}[data-test-schema-name]`,
      /* istanbul ignore next */
      input => input.blur(),
    );

    for (const { name: fieldName, type: fieldType } of schema.fields) {
      await page.click(`${inA}[data-test-schema-field-add]`);
      await page.selectOption(`${inB}[data-test-schema-field-type]`, fieldType);
      await type(page, `${inB}[data-test-schema-field-name]`, fieldName);
    }

    await page.click(`${inA}summary`);
  });
}

export function userChangePassword(
  this: BrowserContext,
  { current, new1, new2 }: { current: string; new1: string; new2: string },
) {
  navigate.call(this, 'settings');

  it(`should change password from ${current} to ${new1}/${new2}`, async () => {
    const page = await this.page;
    await page.click('[data-test-settings="credentials"] details');
    await type(page, '#current', current);
    await type(page, '#new1', new1);
    await type(page, '#new2', new2);
    await page.click('[title="Change password"]');
    await page.click('[data-test-settings="credentials"] details');
  });
}

export function userLogIn(
  this: BrowserContext,
  user: { email: string; password: string },
) {
  navigate.call(this, 'login');

  it(`should log in as ${user.email}:${user.password}`, async () => {
    const page = await this.page;
    await page.waitForSelector('[href="/signup"]');

    await type(page, '#email', user.email);
    await type(page, '#password', user.password);

    await page.click('[data-test-user="login"]');
  });
}

export function userLogOut(this: BrowserContext) {
  it('should log out', async () => {
    const page = await this.page;
    await page.click('[data-test-navigation="logout"]');
  });
}

export function userSignUp(
  this: BrowserContext,
  user: { email: string; password: string },
) {
  navigate.call(this, 'login');

  it(`should sign in as ${user.email}:${user.password}`, async () => {
    const page = await this.page;
    await page.click('[href="/signup"]');
    await page.waitForSelector('[href="/signup"]', { state: 'hidden' });

    await type(page, '#email', user.email);
    await type(page, '#password', user.password);

    await page.click('[data-test-user="signup"]');
  });
}
