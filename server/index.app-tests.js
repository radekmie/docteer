// @flow

import faker from 'faker';

import {Accounts} from 'meteor/accounts-base';
import {Meteor} from 'meteor/meteor';
import {before} from 'meteor/universe:e2e'; // $FlowFixMe: No local file.
import {createBrowser} from 'meteor/universe:e2e'; // $FlowFixMe: No local file.
import {describe} from 'meteor/universe:e2e'; // $FlowFixMe: No local file.
import {it} from 'meteor/universe:e2e'; // $FlowFixMe: No local file.

import type {Browser} from 'puppeteer';
import type {Page} from 'puppeteer';

let browser: Browser = null;
let page: Page = null;

//

faker.user = () => {
  const user = {
    _id: null,
    email: faker.internet.email(),
    password: faker.internet.password()
  };

  return user;
};

faker.user.registered = () => {
  const user = faker.user();

  user._id = Accounts.createUser(user);

  Meteor.users.update(user._id, {
    $set: {
      schemas: [
        {
          name: 'Default',
          fields: {
            name: 'div',
            labels: 'ul',
            text: 'div'
          }
        }
      ]
    }
  });

  return user;
};

//

const action = title =>
  it(`should click '${title}' action button`, async () => {
    const selector = `.bottom-1.fixed.right-1.w2 > [title=${title}]`;
    await page.waitForSelector(selector);
    await page.click(selector);
  });

const click = selector =>
  it(`should click '${selector}'`, async () => {
    await page.click(selector);
  });

const expand = title =>
  it(`should expand section '${title}'`, async () => {
    const summaries = await page.$$('summary');
    const summary = await page.evaluate(
      `Array.from(document.querySelectorAll('summary')).findIndex(x => x.textContent === '${title.replace(
        "'",
        "\\'"
      )}')`
    );

    await summaries[summary].click();
  });

const field = (position, name, value) => {
  it(`should check field ${position + 1} to be called '${name}'`, async () => {
    await page.waitForFunction(
      `(document.querySelector('dl > dt:nth-of-type(${position +
        1}) > b') || {}).textContent === '${name}:'`,
      {polling: 'mutation'}
    );
  });

  it(`should enter field ${position + 1} value`, async () => {
    const selector = `dl > dd:nth-of-type(${position + 1}) > :first-child`;

    await page.click(selector);
    await page.keyboard.down('Control');
    await page.keyboard.down('A');
    await page.keyboard.up('A');
    await page.keyboard.up('Control');

    value = [].concat(value);

    await page.type(value.shift());

    while (value.length) {
      // FIXME: It's not working in contenteditable.
      // await page.press('Enter');
      await page.$eval(selector, input => (input.innerHTML += '<li></li>'));
      await page.press('PageDown');
      await page.type(value.shift());
    }

    await page.$eval(selector, input => input.blur());
  });
};

const login = user =>
  it(`should log in as ${user.email}:${user.password}`, async () => {
    await page.click('[title="Log In"]');

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

const logout = () =>
  it('should log out', async () => {
    await page.waitForSelector('[title="Log Out"]');
    await page.click('[title="Log Out"]');
  });

const navigate = title =>
  it(`should click '${title}' navigation link`, async () => {
    const selector = `.bg-dark-gray.flex.flex-center.flex-column.h-100.near-white.pa3.ph1 > [title="${title}"]`;
    await page.waitForSelector(selector);
    await page.click(selector);
  });

const note = (title, color = 'normal') => {
  if (color === '-') {
    it(`should check if note called '${title}' is not visible`, async () => {
      await page.waitForFunction(
        `Array.from(document.querySelectorAll('.b--dark-gray.bl > *')).every(x => x.textContent !== '${title.replace(
          "'",
          "\\'"
        )}')`,
        {polling: 'mutation'}
      );
    });

    return;
  }

  it(`should check if note called '${title}' is visible`, async () => {
    await page.waitForFunction(
      `Array.from(document.querySelectorAll('.b--dark-gray.bl > *')).some(x => x.textContent === '${title.replace(
        "'",
        "\\'"
      )}')`,
      {polling: 'mutation'}
    );
  });

  it(`should check if note called '${title}' is ${color}`, async () => {
    await page.waitForFunction(
      `Array.from(document.querySelectorAll('.b--dark-gray.bl > .${color ===
      'normal'
        ? 'dark-gray'
        : `hover-${color}`}')).some(x => x.textContent === '${title.replace(
        "'",
        "\\'"
      )}')`,
      {polling: 'mutation'}
    );
  });
};

const resize = (width, height) =>
  it(`should resize to ${width}x${height}`, async () => {
    await page.setViewport({height, width});

    // Window frame.
    height += 85;

    const {targetInfos: [{targetId}]} = await browser._connection.send(
      'Target.getTargets'
    );
    const {
      windowId
    } = await browser._connection.send('Browser.getWindowForTarget', {
      targetId
    });
    await browser._connection.send('Browser.setWindowBounds', {
      bounds: {height, width},
      windowId
    });
  });

const select = title =>
  it(`should select note called '${title}'`, async () => {
    const note = await page.evaluate(
      `Array.from(document.querySelectorAll('.b--dark-gray.bl > *')).findIndex(x => x.textContent === '${title.replace(
        "'",
        "\\'"
      )}')`
    );
    await page.click(`.b--dark-gray.bl > :nth-child(${note + 1})`);
  });

const start = path =>
  it(`should load ${path}`, async () => {
    const url = Meteor.absoluteUrl(path.slice(1));

    await page.goto(url);
    await page.waitForSelector('main:not(.loading)');
  });

const toast = text =>
  it(`should show toast '${text}'`, async () => {
    await page.waitForFunction(
      `Array.from(document.querySelectorAll('main > :last-child > *')).some(x => x.textContent === '${text.replace(
        "'",
        "\\'"
      )}')`,
      {polling: 'mutation'}
    );
  });

const type = (selector, text) =>
  it(`should type '${text}' in '${selector}'`, async () => {
    await page.click(selector);
    await page.type(text);
  });

//

before(async () => {
  ({browser, page} = await createBrowser({
    args: ['--disable-gpu', '--disable-infobars', '--no-sandbox'],
    slowMo: 1
  }));
});

before(() => {
  resize(1024, 768);
});

describe('Log in fail', () => {
  start('/');
  navigate('Log In');
  login(faker.user());
  toast('Logging in...');
  toast("Sounds good, doesn't work.");
});

describe('Log in success', () => {
  start('/');
  navigate('Log In');
  login(faker.user.registered());
  toast('Logging in...');
  toast('Logged in.');
  toast('Loading...');
  toast('Loaded.');
  logout();
  toast('Logging out...');
  toast('Logged out.');
});

describe('Add note', () => {
  const title = faker.lorem.words();

  start('/');
  navigate('Log In');
  login(faker.user.registered());
  toast('Logging in...');
  toast('Logged in.');
  toast('Loading...');
  toast('Loaded.');
  navigate('Notes');
  action('Create');
  note('(untitled)', 'light-green');
  field(0, 'Name', title);
  field(1, 'Labels', [faker.lorem.word(), faker.lorem.word()]);
  field(2, 'Text', faker.lorem.paragraphs());
  note(title, 'light-green');
  action('Save');
  toast('Saving...');
  toast('Saved.');
  note(title);
  logout();
  toast('Logging out...');
  toast('Logged out.');
});

describe('Add and edit note', () => {
  const title = faker.lorem.words();

  start('/');
  navigate('Log In');
  login(faker.user.registered());
  toast('Logging in...');
  toast('Logged in.');
  toast('Loading...');
  toast('Loaded.');
  navigate('Notes');
  action('Create');
  note('(untitled)', 'light-green');
  field(0, 'Name', title);
  field(1, 'Labels', [faker.lorem.word(), faker.lorem.word()]);
  field(2, 'Text', faker.lorem.paragraphs());
  note(title, 'light-green');
  action('Save');
  toast('Saving...');
  toast('Saved.');
  note(title);
  select(title);
  action('Edit');
  field(2, 'Text', faker.lorem.paragraphs());
  note(title, 'light-blue');
  action('Save');
  toast('Saving...');
  toast('Saved.');
  note(title);
  logout();
  toast('Logging out...');
  toast('Logged out.');
});

describe('Add and remove note before save', () => {
  const title = faker.lorem.words();

  start('/');
  navigate('Log In');
  login(faker.user.registered());
  toast('Logging in...');
  toast('Logged in.');
  toast('Loading...');
  toast('Loaded.');
  navigate('Notes');
  action('Create');
  note('(untitled)', 'light-green');
  field(0, 'Name', title);
  field(1, 'Labels', [faker.lorem.word(), faker.lorem.word()]);
  field(2, 'Text', faker.lorem.paragraphs());
  note(title, 'light-green');
  action('Remove');
  note(title, 'light-gray');
  action('Save');
  note(title, '-');
  logout();
  toast('Logging out...');
  toast('Logged out.');
});

describe('Add and remove note', () => {
  const title = faker.lorem.words();

  start('/');
  navigate('Log In');
  login(faker.user.registered());
  toast('Logging in...');
  toast('Logged in.');
  toast('Loading...');
  toast('Loaded.');
  navigate('Notes');
  action('Create');
  note('(untitled)', 'light-green');
  field(0, 'Name', title);
  field(1, 'Labels', [faker.lorem.word(), faker.lorem.word()]);
  field(2, 'Text', faker.lorem.paragraphs());
  note(title, 'light-green');
  action('Save');
  toast('Saving...');
  toast('Saved.');
  note(title);
  select(title);
  action('Edit');
  action('Remove');
  note(title, 'light-red');
  action('Save');
  note(title, '-');
  toast('Saving...');
  toast('Saved.');
  logout();
  toast('Logging out...');
  toast('Logged out.');
});

describe('Change password incorrect', () => {
  const user1 = faker.user.registered();
  const user2 = faker.user();

  start('/');
  navigate('Log In');
  login(user1);
  toast('Logging in...');
  toast('Logged in.');
  toast('Loading...');
  toast('Loaded.');
  navigate('Settings');
  expand('Change password');
  type('#current', user2.password);
  type('#new1', user2.password);
  type('#new2', user2.password);
  click('[title="Change password"]');
  toast('Changing password...');
  toast('Incorrect old password.');
  logout();
});

describe('Change password mismatch', () => {
  const user1 = faker.user.registered();
  const user2 = faker.user();

  start('/');
  navigate('Log In');
  login(user1);
  toast('Logging in...');
  toast('Logged in.');
  toast('Loading...');
  toast('Loaded.');
  navigate('Settings');
  expand('Change password');
  type('#current', user1.password);
  type('#new1', user1.password);
  type('#new2', user2.password);
  click('[title="Change password"]');
  toast('Changing password...');
  toast('Passwords mismatch.');
  logout();
});

describe('Change password', () => {
  const user1 = faker.user.registered();
  const user2 = faker.user();

  user2.email = user1.email;

  start('/');
  navigate('Log In');
  login(user1);
  toast('Logging in...');
  toast('Logged in.');
  toast('Loading...');
  toast('Loaded.');
  navigate('Settings');
  expand('Change password');
  type('#current', user1.password);
  type('#new1', user2.password);
  type('#new2', user2.password);
  click('[title="Change password"]');
  toast('Changing password...');
  toast('Changed password.');
  logout();
  toast('Logging out...');
  toast('Logged out.');
  navigate('Log In');
  login(user2);
  toast('Logging in...');
  toast('Logged in.');
  toast('Loading...');
  toast('Loaded.');
  logout();
  toast('Logging out...');
  toast('Logged out.');
});
