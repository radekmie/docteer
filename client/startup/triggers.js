// @flow

import createHistory from 'history/createBrowserHistory';
// $FlowFixMe: Untyped import.
import {createLocation} from 'history/LocationUtils';
// $FlowFixMe: Untyped import.
import {createPath} from 'history/PathUtils';

import {compare} from '@shared';
import {onLoginWithToken} from '@client/actions';
import {titleForView} from '@shared';
import {tree} from '@client/state';

// Startup
const history = createHistory();
const storage = window.localStorage || {};

new Promise(window.requestIdleCallback || window.setTimeout)
  .then(() => onLoginWithToken(storage.token))
  .then(loaded, loaded);

function loaded() {
  tree.update(store => {
    --store.load;
    --store.pend;
  });

  syncHistory();
  setInterval(refreshToken, 1 * 60 * 60 * 1000);
}

function refreshToken() {
  if (storage.token) onLoginWithToken(storage.token, true);
}

// Errors
if (process.env.NODE_ENV === 'production') {
  window.addEventListener('unhandledrejection', event => {
    event.preventDefault();
  });
}

// Events
window.document.addEventListener('click', event => {
  if (
    event.altKey ||
    event.button !== 0 ||
    event.ctrlKey ||
    event.metaKey ||
    event.shiftKey
  )
    return;

  let node = event.target;
  do {
    if (node instanceof HTMLAnchorElement && node.__preactattr_) {
      const href = node.getAttribute('href');
      if (href) {
        event.stopImmediatePropagation();
        event.stopPropagation();
        event.preventDefault();

        const prev = createPath(history.location);
        const next = createPath(
          createLocation(href, undefined, undefined, history.location)
        );

        if (prev !== next) history.push(href);

        return;
      }
    }
  } while ((node = node.parentNode));
});

const keyBoth = ['ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowUp'];
const keyNote = ['ArrowDown', 'ArrowUp'];
const keyHelp = ['Escape', '?'];
const keyNext = ['ArrowDown', 'ArrowRight'];

window.document.addEventListener('keydown', event => {
  const {key, target} = event;
  if (target.contentEditable === 'true' || target instanceof HTMLInputElement)
    return;

  if (keyBoth.includes(key)) {
    const list = window.document.querySelector(
      `[data-application] > :nth-child(2) > :nth-child(2) > :nth-child(${1 +
        keyNote.includes(key)}
      )`
    );

    if (!list) return;

    const focus = window.document.activeElement;
    const active =
      focus && focus.parentNode === list
        ? focus
        : list.querySelector('[data-item]');
    const item =
      (active &&
        active[`${keyNext.includes(key) ? 'next' : 'previous'}Sibling`]) ||
      (keyNext.includes(key) ? list.lastChild : list.children[0]);
    if (item && item.pathname && item !== active) {
      item.focus();
      if (item.pathname !== '/d' && keyNote.includes(key)) item.click();
      event.preventDefault();
    }
  } else if (keyHelp.includes(key)) {
    tree.updateWith({help: key === '?'});
  } else if (key === 'Enter') {
    if (target.__preactattr_ && target.__preactattr_.onClick) target.click();
  }
});

// History
history.listen(syncHistory);

// Tree
tree.on(({href}) => {
  if (createPath(history.location) !== href.replace(/\?$/, ''))
    history.push(href);
});

tree.on(({filter, labels}) => {
  const filterAvailable = filter.filter(name =>
    labels.find(label => label.name === name)
  );

  if (filter.length !== filterAvailable.length)
    tree.updateWith({filter: filterAvailable.sort(compare)});
});

tree.on(({userToken}) => {
  if (userToken) storage.token = userToken;
  else delete storage.token;
});

// Helpers
const pattern = /^\/(\w+)?(?:\/(\w+))?.*?(?:[&?]filter=([^&?]+))?(?:[&?]search=([^&?]+))?.*$/;

function syncHistory() {
  // eslint-disable-next-line complexity
  tree.update((store, {notes, userLoggedIn}) => {
    const [, view, noteId, filterString, search] =
      pattern.exec(createPath(history.location)) || [];

    store.view =
      view === 'login' ||
      view === 'notes' ||
      view === 'settings' ||
      view === 'signup'
        ? view
        : '';

    const invalidView =
      (userLoggedIn && store.view === '') ||
      (userLoggedIn && store.view === 'login') ||
      (userLoggedIn && store.view === 'signup') ||
      (!userLoggedIn && store.view === 'notes') ||
      (!userLoggedIn && store.view === 'settings');

    if (invalidView) store.view = userLoggedIn ? 'notes' : '';

    store.search = userLoggedIn && search ? decodeURIComponent(search) : '';

    const filter =
      userLoggedIn && filterString
        ? decodeURIComponent(filterString)
            .split(',')
            .sort(compare)
        : [];

    if (store.filter.length !== filter.length) {
      store.filter = filter;
    } else {
      for (let index = 0; index < filter.length; ++index)
        store.filter[index] = filter[index];
    }

    store.noteId =
      userLoggedIn && store.view === 'notes' ? noteId || null : null;
    store.noteId = notes.some(note => note._id === store.noteId)
      ? store.noteId
      : null;

    document.title = `${titleForView(store.view)} | DocTeer`;
  });
}
