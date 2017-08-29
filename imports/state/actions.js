import fuzzysort from 'fuzzysort';

import {Accounts} from 'meteor/accounts-base';
import {Meteor}   from 'meteor/meteor';

import {schemaEmpty} from '/imports/lib/schemas';

import {tree} from './instance';

export function onAdd () {
  const _id = Math.random().toString(36).substr(2, 6);

  const schema = tree.get(['user']).schemas[0];

  tree.set(['docsUpdated', _id], Object.assign({_outline: schema}, schemaEmpty(schema)));
  tree.set(['docsCreated', _id], true);
  tree.set(['docId'], _id);
  tree.set(['edit'], true);
}

export function onChange (_id, key, value) {
  if (tree.get(['docsUpdated', _id])) {
    tree.set(['docsUpdated', _id, key], value);
  } else {
    tree.set(['docsUpdated', _id], {[key]: value});
  }
}

export function onEdit () {
  if (!tree.set(['edit'], !tree.get(['edit']))) {
    onReset();
  }
}

export function onLogin (email, password) {
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

export function onRefresh (firstRun) {
  if (tree.get(['user']) === undefined) {
    tree.set(['docsOrigins'], []);

    return Promise.resolve();
  }

  toast('info', firstRun === true ? 'Loading...' : 'Refreshing...');

  const last = new Date();

  return graphQL({
    query: 'query Docs ($refresh: Date!, $session: String!, $userId: String!) { docs (refresh: $refresh, session: $session, userId: $userId) { created removed updated } }',
    operationName: 'Docs',
    variables: {refresh: tree.get(['last'])}
  }).then(response => {
    tree.set(['last'], last);
    toast('success', firstRun === true ? 'Loaded.' : 'Refreshed.');
    merge(response.data.docs);
  });
}

export function onRemove () {
  tree.set(['docsRemoved', tree.get(['docId'])], true);
  tree.set(['docId'], undefined);
}

export function onReset () {
  if (tree.get(['docsCreated'])[tree.get(['docId'])]) {
    tree.set(['docId'], undefined);
  }

  tree.set(['docsCreated'], Object.create(null));
  tree.set(['docsRemoved'], Object.create(null));
  tree.set(['docsUpdated'], Object.create(null));
}

export function onSave () {
  tree.set(['edit'], false);

  const created = tree.get(['docsCreated']);
  const removed = tree.get(['docsRemoved']);
  const updated = tree.get(['docsUpdated']);

  const patch = {
    refresh: tree.get(['last']),
    created: Object.keys(created),
    removed: Object.keys(removed),
    updated: Object.keys(updated).map(_id => Object.assign({_id}, updated[_id]))
  };

  const skippable = patch.created.filter(_id => patch.removed.includes(_id));

  patch.created = patch.created.filter(_id => !skippable.includes(_id));
  patch.removed = patch.removed.filter(_id => !skippable.includes(_id));
  patch.updated = patch.updated.filter(doc => !skippable.includes(doc._id));

  if (!patch.created.length && !patch.removed.length && !patch.updated.length) {
    onReset();

    return Promise.resolve();
  }

  toast('info', 'Saving...');

  const last = new Date();

  return graphQL({
    query: 'mutation DocsPatch ($refresh: Date!, $session: String!, $userId: String!, $created: [String!]!, $removed: [String!]!, $updated: [Doc!]!) { docsPatch (refresh: $refresh, session: $session, userId: $userId, created: $created, removed: $removed, updated: $updated) { created removed updated } }',
    operationName: 'DocsPatch',
    variables: patch
  }).then(response => {
    tree.set(['last'], last);
    toast('success', 'Saved.');
    merge(response.data.docsPatch);
    onReset();
  });
}

export function onSchemaAdd () {
  const schema = tree.get(['user', 'schemas', 0]);

  tree.set(['userDiff', 'schemas'], [Object.assign({}, schema, {[`_${Object.keys(schema).length}`]: 'div'})]);
}

export function onSchemaDelete (event) {
  const index = +event.target.parentNode.dataset.index;
  const schema = tree.get(['user', 'schemas', 0]);

  tree.set(['userDiff', 'schemas'], [Object.keys(schema).reduce((next, key, index2) => index === index2 ? next : Object.assign(next, {[key]: schema[key]}), {})]);
}

export function onSchemaKey (event) {
  const index = +event.target.parentNode.dataset.index;
  const schema = tree.get(['user', 'schemas', 0]);

  tree.set(['userDiff', 'schemas'], [Object.keys(schema).reduce((next, key, index2) => Object.assign(next, {[index === index2 ? event.target.value : key]: schema[key]}), {})]);
}

export function onSchemaOrder (event) {
  const index = +event.target.parentNode.dataset.index;
  const schema = tree.get(['user', 'schemas', 0]);
  const fields = Object.keys(schema);

  fields[index] = fields.splice(index + (+event.target.dataset.order), 1, fields[index])[0];

  tree.set(['userDiff', 'schemas'], [fields.reduce((next, key) => Object.assign(next, {[key]: schema[key]}), {})]);
}

export function onSchemaType (event) {
  const index = +event.target.parentNode.dataset.index;
  const schema = tree.get(['user', 'schemas', 0]);

  tree.set(['userDiff', 'schemas'], [Object.keys(schema).reduce((next, key, index2) => Object.assign(next, {[key]: index === index2 ? event.target.value : schema[key]}), {})]);
}

export function onSearch (event) {
  tree.set(['search'], event.target.value);
}

export function onSettingsReset () {
  tree.set(['userDiff'], undefined);
  history.back();
}

export function onSettingsSave () {
  if (tree.get(['userDiff'])) {
    toast('info', 'Saving...');

    Meteor.call('users.settings', tree.get(['userDiff']), error => {
      toast(error ? 'error' : 'success', error || 'Saved.');
      onSettingsReset();
    });
  }
}

export function onTypeAhead (event) {
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
    const match = fuzzysort.go(search, tree.get(['labelsNames']))[0];

    if (match && match._target.startsWith(search)) {
      const start = selection.focusOffset;
      const label = match._target.slice(start);

      if (label) {
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
  tree.set(['docsOrigins'], tree.get(['docsOrigins'])
    .filter(doc => !diff.removed.includes(doc._id))
    .concat(diff.created.map(_id => ({_id})))
    .filter((doc, index, docs) => docs.findIndex(other => other._id === doc._id) === index)
    .map(doc => {
      const  patch = diff.updated.find(updated => updated._id === doc._id);
      return patch ? Object.assign({}, doc, patch) : doc;
    })
  );
}

function toast (type, textOrError) {
  const _id = Math.random().toString(36);
  const text = type === 'error'
    ? textOrError.error === 403
      ? 'Sounds good, doesn\'t work.'
      : textOrError.reason || textOrError.message
    : textOrError
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
