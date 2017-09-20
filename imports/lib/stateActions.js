// @flow

import fuzzysort from 'fuzzysort';

import {Accounts} from 'meteor/accounts-base';
import {Meteor}   from 'meteor/meteor';

import {schemaEmpty} from '/imports/lib/schemas';
import {tree}        from '/imports/lib/state';

export function onAdd () {
  const _id = Math.random().toString(36).substr(2, 6);

  const schema = tree.get(['user']).schemas[0].fields;

  tree.set(['notesUpdated', _id], Object.assign({_outline: schema}, schemaEmpty(schema)));
  tree.set(['notesCreated', _id], true);
  tree.set(['noteId'], _id);
  tree.set(['edit'], true);
}

export function onChange (_id: string, key: string, value: string | string[]) {
  if (tree.get(['notesUpdated', _id])) {
    tree.set(['notesUpdated', _id, key], value);
  } else {
    tree.set(['notesUpdated', _id], {[key]: value});
  }
}

export function onChangePassword (old: string, new1: string, new2: string): Promise<void> {
  toast('info', 'Changing password...');

  return new Promise((resolve, reject) => {
    Meteor.call('users.password', old, new1, new2, error => {
      toast(error ? 'error' : 'success', error || 'Changed password.');
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

export function onEdit () {
  if (!tree.set(['edit'], !tree.get(['edit'])))
    onReset();
}

export function onLogin (email: string, password: string) {
  toast('info', 'Logging in...');

  Meteor.loginWithPassword(email, password, error => {
    toast(error ? 'error' : 'success', error || 'Logged in.');
  });
}

export function onLogout () {
  toast('info', 'Logging out...');

  Meteor.logout(error => {
    toast(error ? 'error' : 'success', error || 'Logged out.');
  });
}

export function onRefresh (firstRun: ?bool): Promise<void> {
  if (tree.get(['user']) === undefined) {
    tree.set(['notesOrigins'], []);

    return Promise.resolve();
  }

  toast('info', firstRun === true ? 'Loading...' : 'Refreshing...');

  const last = new Date();

  return graphQL({
    query: 'query Notes ($refresh: Date!, $session: String!, $userId: String!) { notes (refresh: $refresh, session: $session, userId: $userId) { created removed updated } }',
    operationName: 'Notes',
    variables: {refresh: tree.get(['last'])}
  }).then(response => {
    tree.set(['last'], last);
    toast('success', firstRun === true ? 'Loaded.' : 'Refreshed.');
    merge(response.data.notes);
  });
}

export function onRemove () {
  tree.set(['notesRemoved', tree.get(['noteId'])], true);
  tree.set(['noteId'], undefined);
}

export function onReset () {
  if (tree.get(['notesCreated'])[tree.get(['noteId'])])
    tree.set(['noteId'], undefined);

  tree.set(['notesCreated'], Object.create(null));
  tree.set(['notesRemoved'], Object.create(null));
  tree.set(['notesUpdated'], Object.create(null));
}

export function onSave (): Promise<void> {
  tree.set(['edit'], false);

  const created = tree.get(['notesCreated']);
  const removed = tree.get(['notesRemoved']);
  const updated = tree.get(['notesUpdated']);

  const patch = {
    refresh: tree.get(['last']),
    created: Object.keys(created),
    removed: Object.keys(removed),
    updated: Object.keys(updated).map(_id => Object.assign({_id}, updated[_id]))
  };

  const skippable = patch.created.filter(_id => patch.removed.includes(_id));

  patch.created = patch.created.filter(_id => !skippable.includes(_id));
  patch.removed = patch.removed.filter(_id => !skippable.includes(_id));
  patch.updated = patch.updated.filter(note => !skippable.includes(note._id));

  if (!patch.created.length && !patch.removed.length && !patch.updated.length) {
    onReset();

    return Promise.resolve();
  }

  toast('info', 'Saving...');

  const last = new Date();

  return graphQL({
    query: 'mutation NotesPatch ($refresh: Date!, $session: String!, $userId: String!, $created: [String!]!, $removed: [String!]!, $updated: [Note!]!) { notesPatch (refresh: $refresh, session: $session, userId: $userId, created: $created, removed: $removed, updated: $updated) { created removed updated } }',
    operationName: 'NotesPatch',
    variables: patch
  }).then(response => {
    tree.set(['last'], last);
    toast('success', 'Saved.');
    merge(response.data.notesPatch);
    onReset();
  });
}

export function onSchemaAdd () {
  tree.push(['userDiff', 'schemas'], {
    name: `_${tree.get(['user', 'schemas']).length}`,
    fields: {name: 'div', labels: 'ul'}
  });
}

// TODO: Should use Event instead, but Flow definition is not complete.
type Event$ = {target: {dataset: {[string]: string}, parentNode: HTMLElement, value: string}};

export function onSchemaDelete (event: Event$) {
  const name = event.target.parentNode.dataset.name;
  const index = +event.target.parentNode.dataset.index;
  const schema = tree.get(['user', 'schemas', {name}, 'fields']);

  tree.set(['userDiff', 'schemas', {name}, 'fields'], Object.keys(schema).reduce((next, key, index2) => index === index2 ? next : Object.assign(next, {[key]: schema[key]}), {}));
}

export function onSchemaField (event: Event$) {
  const name = event.target.parentNode.dataset.name;
  const schema = tree.get(['user', 'schemas', {name}, 'fields']);

  tree.set(['userDiff', 'schemas', {name}, 'fields'], Object.assign({}, schema, {[`_${Object.keys(schema).length}`]: 'div'}));
}

export function onSchemaKey (event: Event$) {
  const name = event.target.parentNode.dataset.name;
  const index = +event.target.parentNode.dataset.index;
  const schema = tree.get(['user', 'schemas', {name}, 'fields']);

  tree.set(['userDiff', 'schemas', {name}, 'fields'], Object.keys(schema).reduce((next, key, index2) => Object.assign(next, {[index === index2 ? event.target.value : key]: schema[key]}), {}));
}

export function onSchemaName (event: Event$) {
  const name = event.target.parentNode.dataset.name;

  tree.set(['userDiff', 'schemas', {name}, 'name'], event.target.value);
}

export function onSchemaOrder (event: Event$) {
  const name = event.target.parentNode.dataset.name;
  const index = +event.target.parentNode.dataset.index;
  const schema = tree.get(['user', 'schemas', {name}, 'fields']);
  const fields = Object.keys(schema);

  fields[index] = fields.splice(index + (+event.target.dataset.order), 1, fields[index])[0];

  tree.set(['userDiff', 'schemas', {name}, 'fields'], fields.reduce((next, key) => Object.assign(next, {[key]: schema[key]}), {}));
}

export function onSchemaRemove (event: Event$) {
  const name = event.target.parentNode.dataset.name;

  tree.unset(['userDiff', 'schemas', {name}]);
}

export function onSchemaType (event: Event$) {
  const name  = event.target.parentNode.dataset.name;
  const field = event.target.parentNode.dataset.field;

  tree.set(['userDiff', 'schemas', {name}, 'fields', field], event.target.value);
}

// TODO: Should use Event instead, but Flow definition is not complete.
type InputEvent$ = {target: HTMLInputElement & {|__skip: ?bool|}};

export function onSearch (event: InputEvent$) {
  tree.set(['search'], event.target.value);
}

export function onSettingsReset () {
  tree.set(['userDiff'], {schemas: tree.get(['userData']).schemas});
}

export function onSettingsSave () {
  if (tree.get(['userDiff'])) {
    toast('info', 'Saving...');

    Meteor.call('users.settings', tree.get(['userDiff']), error => {
      toast(error ? 'error' : 'success', error || 'Saved.');

      if (!error)
        onSettingsReset();
    });
  }
}

export function onTypeAhead (event: InputEvent$) {
  if (event.target.__skip) {
    return;
  }

  const selection = window.getSelection();
  const focusNode = selection.focusNode;
  const search = (
    focusNode.wholeText &&
    focusNode.wholeText.trim()
  );

  if (search) {
    const names = tree.get(['labelsNames']).filter(label => label !== search && label.startsWith(search));
    const match = fuzzysort.go(search, names)[0];

    if (match) {
      const start = selection.focusOffset;
      const label = match.target.slice(start);

      if (label) {
        event.target.__skip = true;

        document.execCommand('insertText', true, label);
        selection.setBaseAndExtent(focusNode, start, focusNode, focusNode.length);
      }
    }
  }
}

onTypeAhead.pre = event => {
  event.target.__skip = event.ctrlKey || event.metaKey || !event.key || event.key.length !== 1;
};

onTypeAhead.post = event => {
  event.target.__skip = true;
};

function graphQL (body) {
  const json = 'application/json';

  return fetch('/graphql', {
    method: 'POST',
    headers: new Headers({
      'Accept':       json,
      'Content-Type': json
    }),
    body: JSON.stringify(Object.assign({}, body, {
      variables: Object.assign({}, body.variables, {
        session: Accounts._storedLoginToken(),
        userId:  Accounts._storedUserId()
      })
    }))
  }).then(response => {
    if (response.ok) {
      return response.json().then(response => {
        if (response.errors) {
          throw new Error(response.errors[0].message);
        }

        return response;
      });
    }

    throw new Error(response.statusText);
  }).catch(error => {
    toast('error', error);
    throw error;
  });
}

function merge (diff) {
  tree.set(['notesOrigins'], tree.get(['notesOrigins'])
    .filter(note => !diff.removed.includes(note._id))
    .concat(diff.created.map(_id => ({_id})))
    .filter((note, index, notes) => notes.findIndex(other => other._id === note._id) === index)
    .map(note => {
      const  patch = diff.updated.find(updated => updated._id === note._id);
      return patch ? Object.assign({}, note, patch) : note;
    })
  );
}

function toast (type, message) {
  const _id = Math.random().toString(36);
  const text = message instanceof Error
    ? message.error === 403
      ? 'Sounds good, doesn\'t work.'
      : message.reason || message.message
    : message
  ;

  tree.push(['toasts'], {_id, dead: false, marked: type === 'info', text, type});

  if (type === 'info') {
    tree.set(['pend'], tree.get(['pend']) + 1);
  } else {
    const info = tree.get(['toasts']).find(toast => toast.marked)._id;

    tree.set(['toasts', {_id: info}, 'marked'], false);

    setTimeout(() => {
      tree.set(['pend'], tree.get(['pend']) - 1);
    }, 500);

    setTimeout(() => {
      tree.set(['toasts', {_id: info}, 'dead'], true);
    }, 1000);

    setTimeout(() => {
      tree.set(['toasts', {_id}, 'dead'], true);
    }, 1250);

    setTimeout(() => {
      tree.unset(['toasts', {_id}]);
      tree.unset(['toasts', {_id: info}]);
    }, 1500);
  }
}
