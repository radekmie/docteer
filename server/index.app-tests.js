import faker from 'faker';

import {Accounts} from 'meteor/accounts-base';
import {Meteor}   from 'meteor/meteor';
import {browser}  from 'meteor/universe:e2e';
import {describe} from 'meteor/universe:e2e';
import {it}       from 'meteor/universe:e2e';
import {page}     from 'meteor/universe:e2e';

//

const user = {
  _id: null,
  email: faker.internet.email(),
  password: faker.internet.password()
};

const userNonExisting = {
  email: faker.internet.email(),
  password: faker.internet.password()
};

user._id = Accounts.createUser(user);

Meteor.users.update(user._id, {
  $set: {
    schemas: [{
      name: 'Default',
      fields: {
        name: 'div',
        labels: 'ul',
        text: 'div'
      }
    }]
  }
});

//

const action = title =>
  it(`should click '${title}' action button`, async () => {
    const selector = `.bottom-1.fixed.right-1.w2 > [title=${title}]`;
    await page.waitForSelector(selector);
    await page.click(selector);
  })
;

// eslint-disable-next-line no-unused-vars
const close = page =>
  it(`should close '${page}'`, async () => {
    const {targetInfos} = await browser._connection.send('Target.getTargets');
    const {targetId} = targetInfos.find(target => target.url === page);
    await browser._connection.send('Target.closeTarget', {targetId});
  })
;

const field = (position, name, value) => {
  it(`should check field ${position + 1} to be called '${name}'`, async () => {
    await page.waitForFunction(
      `(document.querySelector('dl > dt:nth-of-type(${position + 1}) > b') || {}).textContent === '${name}:'`,
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
      await page.press('Enter');
      await page.type(value.shift());
    }
  });
};

const login = user =>
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

    await page.click('[title="Log In"]');
  })
;

const logout = () =>
  it('should log out', async () => {
    await page.click('[title="Log Out"]');
  })
;

const note = (title, color) => {
  it(`should check if note called '${title}' is visible`, async () => {
    await page.waitForFunction(
      `Array.from(document.querySelectorAll('.flex-1.ma0.overflow-auto > *')).some(x => x.textContent === '${title.replace('\'', '\\\'')}')`,
      {polling: 'mutation'}
    );
  });

  if (color) {
    it(`should check if note called '${title}' is ${color}`, async () => {
      await page.waitForFunction(
        `Array.from(document.querySelectorAll('.flex-1.ma0.overflow-auto > .hover-${color}')).some(x => x.textContent === '${title.replace('\'', '\\\'')}')`,
        {polling: 'mutation'}
      );
    });
  }
};

const resize = (width, height) =>
  it(`should resize to ${width}x${height}`, async () => {
    await page.setViewport({height, width});

    // "Chrome is being..." bar.
    height += 40;

    // Window frame.
    height += 85;

    const {targetInfos: [{targetId}]} = await browser._connection.send('Target.getTargets');
    const {windowId} = await browser._connection.send('Browser.getWindowForTarget', {targetId});
    await browser._connection.send('Browser.setWindowBounds', {bounds: {height, width}, windowId});
  })
;

const start = path =>
  it(`should load ${path}`, async () => {
    const url = Meteor.absoluteUrl(path.slice(1));

    if (await page.url() !== url)
      await page.goto(url);

    await page.waitForSelector('main:not(.loading)');
  })
;

const toast = text =>
  it(`should show toast '${text}'`, async () => {
    await page.waitForFunction(
      `Array.from(document.querySelectorAll('main > :last-child > *')).some(x => x.textContent === '${text.replace('\'', '\\\'')}')`,
      {polling: 'mutation'}
    );
  })
;

describe('docteer.com', () => {
  // FIXME: Remember about {args: ['--no-sandbox']}.
  // TODO: Makes sense only in non-headless mode.
  // close('chrome://newtab/');

  resize(1024, 768);

  describe('Log In (fail)', () => {
    start('/');
    login(userNonExisting);
    toast('Logging in...');
    toast('Sounds good, doesn\'t work.');
  });

  describe('Log In (success) and Log Out', () => {
    start('/');
    login(user);
    toast('Logging in...');
    toast('Logged in.');
    toast('Loading...');
    toast('Loaded.');
    logout(user);
    toast('Logging out...');
    toast('Logged out.');
  });

  describe('Add note', () => {
    start('/');
    login(user);
    toast('Logging in...');
    toast('Logged in.');
    toast('Loading...');
    toast('Loaded.');
    action('Create');
    note('(untitled)', 'light-green');
    field(0, 'Name', 'Hello!');
    field(1, 'Labels', ['Label 1', 'Label 2']);
    field(2, 'Text', 'World!');
    note('Hello!', 'light-green');
    action('Save');
    note('Hello!');
    logout(user);
    toast('Logging out...');
    toast('Logged out.');
  });
});
