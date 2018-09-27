// @flow

import createHistory from 'history/createBrowserHistory';
import {createLocation} from 'history/LocationUtils';
import {createPath} from 'history/PathUtils';

import {compare} from '@lib';
import {onLoginWithToken} from '@client/actions';
import {titleForView} from '@lib';
import {tree} from '@client/state';

// Startup
const history = createHistory();
const storage = window.localStorage || {};

new Promise(window.requestIdleCallback || window.setTimeout)
  .then(() => onLoginWithToken({token: storage.token}))
  .then(loaded, loaded);

function loaded() {
  tree.set(['load'], tree.get(['load']) - 1);
  tree.set(['pend'], tree.get(['pend']) - 1);
  syncHistory();
  setInterval(refreshToken, 1 * 60 * 60 * 1000);
}

function refreshToken() {
  if (storage.token)
    onLoginWithToken({skipRefresh: true, token: storage.token});
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
    if (
      String(node.nodeName).toLowerCase() === 'a' &&
      node.getAttribute('href') &&
      (node.__preactattr_ || node[Symbol.for('preactattr')])
    ) {
      event.stopImmediatePropagation && event.stopImmediatePropagation();
      event.stopPropagation && event.stopPropagation();
      event.preventDefault();

      const href = node.getAttribute('href');
      const prev = createPath(history.location);
      const next = createPath(
        createLocation(href, undefined, undefined, history.location)
      );

      if (prev !== next) history.push(href);

      return;
    }
  } while ((node = node.parentNode));
});

const keyBoth = ['ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowUp'];
const keyNote = ['ArrowDown', 'ArrowUp'];
const keyHelp = ['Escape', '?'];
const keyNext = ['ArrowDown', 'ArrowRight'];

window.document.addEventListener('keydown', event => {
  const target = event.target;

  if (
    target.contentEditable === 'true' ||
    target.tagName.toLowerCase() === 'input'
  )
    return;

  if (keyBoth.includes(event.key)) {
    const list = window.document.querySelector(
      `[data-application] > :nth-child(2) > :nth-child(2) > :nth-child(${1 +
        keyNote.includes(event.key)}
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
        active[
          `${keyNext.includes(event.key) ? 'next' : 'previous'}Sibling`
        ]) ||
      (keyNext.includes(event.key) ? list.lastChild : list.children[0]);
    if (item && item.pathname && item !== active) {
      item.focus();
      if (item.pathname !== '/d' && keyNote.includes(event.key)) item.click();
      event.preventDefault();
    }
  } else if (keyHelp.includes(event.key)) {
    tree.set(['help'], event.key === '?');
  } else if (event.key === 'Enter') {
    if (target.__preactattr_ && target.__preactattr_.onClick) target.click();
  }
});

// History
history.listen(syncHistory);

// Tree
tree.select(['href']).on('update', event => {
  if (createPath(history.location) !== event.data.currentData)
    history.push(event.data.currentData);
});

tree.select(['labels']).on('update', event => {
  const filter = tree.get(['filter']);
  const filterAvailable = filter.filter(name =>
    event.data.currentData.find(label => label.name === name)
  );

  if (filter.length !== filterAvailable.length)
    tree.set(['filter'], filterAvailable);
});

tree.select(['userToken']).on('update', event => {
  const token = event.data.currentData;
  if (token) storage.token = token;
  else delete storage.token;
});

// Helpers
const pattern = /^\/(\w+)?(?:\/(\w+))?.*?(?:[&?]filter=([^&?]+))?(?:[&?]search=([^&?]+))?.*$/;

// eslint-disable-next-line complexity
function syncHistory() {
  const loggedIn = tree.get(['userLoggedIn']);

  const match = pattern.exec(createPath(history.location)) || [];
  const state = {
    noteId: (match[1] === 'notes' && match[2]) || undefined,
    filter: match[3]
      ? decodeURIComponent(match[3])
          .split(',')
          .sort(compare)
      : [],
    search: match[4] ? decodeURIComponent(match[4]) : '',
    view: match[1] || ''
  };

  if (!loggedIn) {
    state.noteId = undefined;
    state.filter = [];
    state.search = '';
  }

  if (
    ![
      !loggedIn && 'login',
      !loggedIn && 'signup',
      loggedIn && 'notes',
      loggedIn && 'settings'
    ].includes(state.view)
  )
    state.view = loggedIn ? 'notes' : '';

  document.title = `${titleForView(state.view)} | DocTeer`;

  tree.set(
    ['noteId'],
    tree.get(['notes']).find(note => note._id === state.noteId)
      ? state.noteId
      : undefined
  );
  tree.set(['search'], state.search);
  tree.set(['view'], state.view);

  if (JSON.stringify(tree.get(['filter'])) !== JSON.stringify(state.filter))
    tree.set(['filter'], state.filter);
}
