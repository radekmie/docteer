// @flow

import fuzzysort from 'fuzzysort';

import {hash} from '@lib';
import {schemaEmpty} from '@lib';
import {tree} from './state';

import type {EventType} from '@types';
import type {InputEventType} from '@types';
import type {PatchType} from '@types';
import type {SchemaType} from '@types';

export function onAdd() {
  const _id = Math.random()
    .toString(36)
    .substr(2, 6);

  tree.set(['notesUpdated', _id], schemaEmpty(tree.get(['user']).schemas[0]));
  tree.set(['notesCreated', _id], true);
  tree.set(['noteId'], _id);
  tree.set(['edit'], true);
}

export function onChange(_id: string, key: string, value: string | string[]) {
  if (tree.get(['notesUpdated', _id]))
    tree.set(['notesUpdated', _id, key], value);
  else tree.set(['notesUpdated', _id], {[key]: value});
}

export function onChangePassword(
  old: string,
  new1: string,
  new2: string
): Promise<void> {
  toast('info', 'Changing password...');

  return call('POST', '/api/users/password', {
    new1: hash(new1),
    new2: hash(new2),
    old: hash(old)
  }).then(() => {
    toast('success', 'Changed password.');
  });
}

export function onChangeSchema(_id: string, schema: SchemaType<*>) {
  const doc = tree.get(['notes', {_id}]);

  if (doc) {
    tree.set(
      ['notesUpdated', _id],
      Object.keys(schema.fields).reduce(
        (clone, field) =>
          doc._outline[field] && typeof clone[field] === typeof doc[field]
            ? Object.assign(clone, {[field]: doc[field]})
            : clone,
        schemaEmpty(schema)
      )
    );
  }
}

export function onEdit() {
  if (!tree.set(['edit'], !tree.get(['edit']))) onReset();
}

export function onExport() {
  const link = document.createElement('a');
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(tree.get(['notesOrigins']))], {
      type: 'application/json'
    })
  );

  link.href = url;
  link.download = `docteer-${tree
    .get(['last'])
    .toJSON()
    .slice(0, 16)
    .replace(/[:-]/g, '_')
    .replace('T', '-')}.json`;
  link.style.display = 'none';

  // $FlowFixMe: Is body really nullable?
  document.body.appendChild(link);

  link.click();

  setTimeout(() => {
    // $FlowFixMe: Is body really nullable?
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 0);
}

export function onImport() {
  const input = document.createElement('input');

  input.type = 'file';
  input.accept = '.json';
  input.style.display = 'none';

  // $FlowFixMe: Is body really nullable?
  document.body.appendChild(input);

  input.click();
  input.addEventListener('change', uploaded, false);

  function remove() {
    // $FlowFixMe: Is body really nullable?
    document.body.removeChild(input);
  }

  const removeDelay = setTimeout(remove, 60 * 1000);

  function uploaded() {
    const reader = new FileReader();

    clearTimeout(removeDelay);

    toast('info', 'Importing...');

    reader.readAsText(input.files[0]);
    reader.onerror = () => {
      toast('error', 'Import error.');
    };
    reader.onload = () => {
      try {
        const created = {};
        const updated = {};

        // $FlowFixMe: This will be a string, because of readAsText.
        JSON.parse(reader.result).forEach(row => {
          if (
            typeof row._id !== 'string' ||
            row._id.length === 0 ||
            row._id.length > 100 ||
            (row._outname !== undefined && typeof row._outname !== 'string')
          )
            throw new Error();

          Object.keys(row).forEach(key => {
            if (key.slice(0, 1) === '_') {
              if (key !== '_id' && key !== '_outline' && key !== '_outname')
                throw new Error();
              return;
            }

            if (row._outline[key] === 'div' && typeof row[key] === 'string')
              return;

            if (
              (row._outline[key] === 'ol' || row._outline[key] === 'ul') &&
              row[key].every(line => typeof line === 'string')
            )
              return;

            throw new Error();
          });

          Object.keys(row._outline).forEach(key => {
            if (row[key] === undefined) throw new Error();
          });

          if (!tree.get(['notesOrigins', {_id: row._id}]))
            created[row._id] = true;

          updated[row._id] = row;
        });

        tree.merge(['notesUpdated'], updated);
        tree.merge(['notesCreated'], created);
        tree.set(['edit'], true);
        tree.set(['view'], 'notes');

        toast('success', 'Imported.');
      } catch (error) {
        toast('error', 'Import error.');
      }

      remove();
    };
  }
}

export function onLogin(email: string, password: string): Promise<void> {
  toast('info', 'Logging in...');

  return call('POST', '/api/users/login', {
    email,
    password: hash(password)
  }).then(result => {
    tree.set(['last'], new Date(0));
    tree.set(['userData'], result);
    // $FlowFixMe
    tree.set(['userDiff'], {schemas: result.schemas});
    tree.set(['view'], 'notes');
    toast('success', 'Logged in.');
    onRefresh(true);
  });
}

export function onLogout() {
  toast('info', 'Logging out...');

  tree.set(['userData'], null);
  tree.set(['userDiff'], null);

  toast('success', 'Logged out.');

  tree.set(['view'], 'login');
}

let refreshing: null | Promise<void> = null;

function refreshed() {
  refreshing = null;
}

export function onRefresh(firstRun: ?boolean): Promise<void> {
  if (tree.get(['user']) === undefined) {
    tree.set(['notesOrigins'], []);

    return Promise.resolve();
  }

  if (refreshing) return refreshing;

  toast('info', firstRun === true ? 'Loading...' : 'Refreshing...');

  const last = new Date();
  refreshing = call('GET', '/api/notes', {refresh: +tree.get(['last'])})
    // $FlowFixMe
    .then((patch: PatchType<*, *, *>) => {
      tree.set(['last'], last);
      toast('success', firstRun === true ? 'Loaded.' : 'Refreshed.');
      merge(patch);
    })
    .then(refreshed, refreshed);

  return refreshing;
}

export function onRemove() {
  tree.set(['notesRemoved', tree.get(['noteId'])], true);
  tree.set(['noteId'], undefined);
}

export function onReset() {
  if (tree.get(['notesCreated'])[tree.get(['noteId'])])
    tree.set(['noteId'], undefined);

  tree.set(['notesCreated'], Object.create(null));
  tree.set(['notesRemoved'], Object.create(null));
  tree.set(['notesUpdated'], Object.create(null));
}

export function onSave(): Promise<void> {
  tree.set(['edit'], false);

  const created = tree.get(['notesCreated']);
  const removed = tree.get(['notesRemoved']);
  const updated = tree.get(['notesUpdated']);

  const patch = {
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

  return call('POST', '/api/notes', {
    patch,
    refresh: +tree.get(['last'])
  }).then(
    // $FlowFixMe
    (patch: PatchType<*, *, *>) => {
      tree.set(['last'], last);
      toast('success', 'Saved.');
      merge(patch);
      onReset();
    },
    error => {
      tree.set(['edit'], true);
      throw error;
    }
  );
}

export function onSchemaAdd() {
  tree.push(['userDiff', 'schemas'], {
    name: `_${tree.get(['user', 'schemas']).length}`,
    fields: {name: 'div', labels: 'ul'}
  });
}

export function onSchemaDelete(event: EventType) {
  const name = event.target.parentNode.dataset.name;
  const index = +event.target.parentNode.dataset.index;
  const schema = tree.get(['user', 'schemas', {name}, 'fields']);

  tree.set(
    ['userDiff', 'schemas', {name}, 'fields'],
    Object.keys(schema).reduce(
      (next, key, index2) =>
        index === index2 ? next : Object.assign(next, {[key]: schema[key]}),
      {}
    )
  );
}

export function onSchemaField(event: EventType) {
  const name = event.target.parentNode.dataset.name;
  const schema = tree.get(['user', 'schemas', {name}, 'fields']);

  tree.set(
    ['userDiff', 'schemas', {name}, 'fields'],
    Object.assign({}, schema, {[`_${Object.keys(schema).length}`]: 'div'})
  );
}

export function onSchemaKey(event: EventType) {
  const name = event.target.parentNode.dataset.name;
  const index = +event.target.parentNode.dataset.index;
  const schema = tree.get(['user', 'schemas', {name}, 'fields']);

  tree.set(
    ['userDiff', 'schemas', {name}, 'fields'],
    Object.keys(schema).reduce(
      (next, key, index2) =>
        Object.assign(next, {
          [index === index2 ? event.target.value : key]: schema[key]
        }),
      {}
    )
  );
}

export function onSchemaName(event: EventType) {
  const name = event.target.parentNode.dataset.name;

  tree.set(['userDiff', 'schemas', {name}, 'name'], event.target.value);
}

export function onSchemaOrder(event: EventType) {
  const name = event.target.parentNode.dataset.name;
  const index = +event.target.parentNode.dataset.index;
  const schema = tree.get(['user', 'schemas', {name}, 'fields']);
  const fields = Object.keys(schema);

  fields[index] = fields.splice(
    index + +event.target.dataset.order,
    1,
    fields[index]
  )[0];

  tree.set(
    ['userDiff', 'schemas', {name}, 'fields'],
    fields.reduce((next, key) => Object.assign(next, {[key]: schema[key]}), {})
  );
}

export function onSchemaRemove(event: EventType) {
  const name = event.target.parentNode.dataset.name;

  tree.unset(['userDiff', 'schemas', {name}]);
}

export function onSchemaType(event: EventType) {
  const name = event.target.parentNode.dataset.name;
  const field = event.target.parentNode.dataset.field;

  tree.set(
    ['userDiff', 'schemas', {name}, 'fields', field],
    event.target.value
  );
}

export function onSearch(event: InputEventType) {
  tree.set(['search'], event.target.value);
}

export function onSettingsReset() {
  tree.set(['userDiff'], {schemas: tree.get(['userData']).schemas});
}

export function onSettingsSave() {
  if (tree.get(['userDiff'])) {
    toast('info', 'Saving...');

    call('POST', '/api/users/settings', tree.get(['userDiff'])).then(() => {
      toast('success', 'Saved.');
      onSettingsReset();
    });
  }
}

export function onSignup(email: string, password: string): Promise<void> {
  toast('info', 'Signing up...');

  return call('POST', '/api/users/register', {
    email,
    password: hash(password)
  }).then(result => {
    tree.set(['last'], new Date(0));
    tree.set(['noteId'], 'introduction');
    tree.set(['userData'], result);
    // $FlowFixMe
    tree.set(['userDiff'], {schemas: result.schemas});
    tree.set(['view'], 'notes');
    toast('success', 'Signed in.');
  });
}

export function onTypeAhead(event: InputEventType) {
  if (event.target.__skip) return;

  const selection = window.getSelection();
  const focusNode = selection.focusNode;
  const search = focusNode.wholeText && focusNode.wholeText.trim();

  if (search) {
    const names = tree
      .get(['labels'])
      .map(label => label.name)
      .filter(label => label !== search && label.startsWith(search));
    const match = fuzzysort.go(search, names)[0];

    if (match) {
      const start = selection.focusOffset;
      const label = match.target.slice(start);

      if (label) {
        event.target.__skip = true;

        document.execCommand('insertText', true, label);
        selection.setBaseAndExtent(
          focusNode,
          start,
          focusNode,
          focusNode.length
        );
      }
    }
  }
}

onTypeAhead.pre = event => {
  event.target.__skip =
    event.ctrlKey || event.metaKey || !event.key || event.key.length !== 1;
};

onTypeAhead.post = event => {
  event.target.__skip = true;
};

function merge(diff) {
  tree.set(
    ['notesOrigins'],
    tree
      .get(['notesOrigins'])
      .filter(note => !diff.removed.includes(note._id))
      .concat(diff.created.map(_id => ({_id})))
      .filter(
        (note, index, notes) =>
          notes.findIndex(other => other._id === note._id) === index
      )
      .map(note => {
        const patch = diff.updated.find(updated => updated._id === note._id);
        return patch ? Object.assign({}, note, patch) : note;
      })
  );
}

function call(method: 'GET' | 'POST', path, data) {
  const headers = new Headers({'Content-Type': 'application/json'});
  const url = new URL(path, location.origin);

  let body;
  if (method === 'GET') {
    for (const [key, value] of Object.entries(data))
      url.searchParams.append(key, String(value));
  } else {
    body = JSON.stringify(data);
  }

  const token = tree.get(['userToken']);
  if (token) headers.append('Authorization', `Bearer ${token}`);

  return new Promise((resolve, reject) => {
    const id = setTimeout(done, 5000, new Error('Sorry, try again later.'));

    fetch(url, {body, headers, method})
      .then(response => {
        if (!response.ok) throw new Error();
        return response.json();
      })
      .then(response => {
        if (response.error) throw Object.assign(new Error(), response.error);
        return response.result;
      })
      .then(response => done(null, response), done);

    function done(error, response) {
      clearTimeout(id);

      if (error) {
        toast('error', error);
        reject(error);
      } else {
        resolve(response);
      }
    }
  });
}

function toast(type, message) {
  const _id = Math.random().toString(36);
  const text =
    message instanceof Error // $FlowFixMe
      ? message.code // $FlowFixMe
        ? message.text
        : message.message
      : message;

  tree.push(['toasts'], {
    _id,
    dead: false,
    marked: type === 'info',
    text,
    type
  });

  if (type === 'info') tree.set(['pend'], tree.get(['pend']) + 1);
  else {
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
