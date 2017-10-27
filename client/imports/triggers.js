// @flow

import createHistory from 'history/createBrowserHistory';
import {createLocation} from 'history/LocationUtils';

import {Meteor} from 'meteor/meteor';
import {Tracker} from 'meteor/tracker';

import {onRefresh} from '../../imports/actions';
import {tree} from '../../imports/state';

const history = createHistory();

let firstRun = true;

// Collections
Meteor.subscribe('users.self', {
  onReady() {
    if (!Meteor.userId()) update();
  },

  onStop(error) {
    if (error) update();
  }
});

Tracker.autorun(() => {
  const user = Meteor.user();

  if (tree.set(['userData'], user && user.schemas ? user : undefined)) {
    tree.set(['userDiff'], {schemas: user.schemas});
    tree.set(['last'], new Date(0));

    if (history.location.pathname === '/') tree.set(['view'], 'd');
  }
});

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
      const prev = history.createHref(history.location);
      const next = history.createHref(
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
      `.app > :nth-child(2) > :nth-child(2) > :nth-child(${1 +
        keyNote.includes(event.key)}
      )`
    );
    const focus = window.document.activeElement;
    const active =
      focus && focus.parentNode === list ? focus : list.querySelector('.bl');
    const item =
      (active &&
        active[
          `${keyNext.includes(event.key) ? 'next' : 'previous'}Sibling`
        ]) ||
      (keyNext.includes(event.key) ? list.lastChild : list.children[0]);
    if (item && item.pathname) {
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
  if (history.createHref(history.location) !== event.data.currentData)
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

tree.select(['userData']).on('update', event => {
  if (
    !event.currentData ||
    !event.previousData ||
    event.previousData._id !== event.currentData._id
  )
    onRefresh(true).then(update);
});

// Helpers
const pattern = /^\/(\w)?(?:\/(\w+))?.*?(?:[&?]filter=([^&?]+))?(?:[&?]search=([^&?]+))?.*$/;

function syncHistory(location) {
  if (firstRun) return;

  const user = tree.get(['user']);

  const match = pattern.exec(history.createHref(location)) || [];
  const state = {
    noteId: (match[1] === 'd' && match[2]) || undefined,
    filter: match[3]
      ? decodeURIComponent(match[3])
          .split(',')
          .sort()
      : [],
    search: match[4] ? decodeURIComponent(match[4]) : '',
    view: match[1] || ''
  };

  if (!user) {
    state.noteId = undefined;
    state.filter = [];
    state.search = '';
  }

  if (
    !['', user && 'd', !user && 'l', !user && 'r', user && 's'].includes(
      state.view
    )
  )
    state.view = '';

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

function update() {
  if (firstRun) {
    firstRun = false;
    tree.set(['load'], tree.get(['load']) - 1);
    tree.set(['pend'], tree.get(['pend']) - 1);
  }

  syncHistory(history.location);
}
