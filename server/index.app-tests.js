import faker from 'faker';

import {Accounts} from 'meteor/accounts-base';
import {Meteor}   from 'meteor/meteor';
import {before}   from 'meteor/universe:e2e';
import {browser}  from 'meteor/universe:e2e';
import {describe} from 'meteor/universe:e2e';
import {it}       from 'meteor/universe:e2e';
import {page}     from 'meteor/universe:e2e';

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

  return user;
};

//

const action = title =>
  it(`should click '${title}' action button`, async () => {
    const selector = `.bottom-1.fixed.right-1.w2 > [title=${title}]`;
    await page.waitForSelector(selector);
    await page.click(selector);
  })
;

const close = (page, {noopIsOK = false} = {}) =>
  it(`should close '${page}'${noopIsOK ? ' (if possible)' : ''}`, async () => {
    const {targetInfos} = await browser._connection.send('Target.getTargets');
    const {targetId} = targetInfos.find(target => target.url === page) || {};

    if (!targetId && noopIsOK)
      return;

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
      // await page.press('Enter');
      await page.$eval(selector, input => input.innerHTML += '<li></li>');
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
  })
;

const logout = () =>
  it('should log out', async () => {
    await page.click('[title="Log Out"]');
  })
;

const navigate = title =>
  it(`should click '${title}' navigation link`, async () => {
    const selector = `.bg-dark-gray.flex.flex-center.flex-column.h-100.near-white.pa3.ph1 > [title=${title}]`;
    await page.waitForSelector(selector);
    await page.click(selector);
  })
;

const note = (title, color = 'normal') => {
  if (color === false) {
    it(`should check if note called '${title}' is not visible`, async () => {
      await page.waitForFunction(
        `Array.from(document.querySelectorAll('.flex-1.ma0.overflow-auto > *')).every(x => x.textContent !== '${title.replace('\'', '\\\'')}')`,
        {polling: 'mutation'}
      );
    });

    return;
  }

  it(`should check if note called '${title}' is visible`, async () => {
    await page.waitForFunction(
      `Array.from(document.querySelectorAll('.flex-1.ma0.overflow-auto > *')).some(x => x.textContent === '${title.replace('\'', '\\\'')}')`,
      {polling: 'mutation'}
    );
  });

  it(`should check if note called '${title}' is ${color}`, async () => {
    await page.waitForFunction(
      `Array.from(document.querySelectorAll('.flex-1.ma0.overflow-auto > .${color === 'normal' ? 'dark-gray' : `hover-${color}`}')).some(x => x.textContent === '${title.replace('\'', '\\\'')}')`,
      {polling: 'mutation'}
    );
  });
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

const select = title =>
  it(`should select note called '${title}'`, async () => {
    const note = await page.evaluate(`Array.from(document.querySelectorAll('.flex-1.ma0.overflow-auto > *')).findIndex(x => x.textContent === '${title.replace('\'', '\\\'')}')`);
    await page.click(`.flex-1.ma0.overflow-auto > :nth-child(${note + 1})`);
  })
;

const start = path =>
  it(`should load ${path}`, async () => {
    const url = Meteor.absoluteUrl(path.slice(1));

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

//

before(() => {
  close('chrome://newtab/', {noopIsOK: true});
  resize(1024, 768);
});

describe('Log in fail', () => {
  start('/');
  login(faker.user());
  toast('Logging in...');
  toast('Sounds good, doesn\'t work.');
});

describe('Log in success and log out', () => {
  start('/');
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
  note(title, false);
  logout();
  toast('Logging out...');
  toast('Logged out.');
});

describe('Add and remove note', () => {
  const title = faker.lorem.words();

  start('/');
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
  note(title, false);
  toast('Saving...');
  toast('Saved.');
  logout();
  toast('Logging out...');
  toast('Logged out.');
});
