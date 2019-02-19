// @flow

import fuzzysort from 'fuzzysort';

import {hash} from '@shared';
import {schemaEmpty} from '@shared';
import * as tree from '@client/state';

import type {EventType} from '@types';
import type {InputEventType} from '@types';
import type {PatchType} from '@types';
import type {SchemaType} from '@types';
import type {StoreType} from '@types';

export function onAdd() {
  const notes = tree.state().notes;

  let _id;
  do {
    _id = Math.random()
      .toString(36)
      .substr(2, 6);
  } while (notes.some(note => note._id === _id));

  tree.update((store, shape) => {
    if (shape.user === null) return;
    store.notesUpdated[_id] = schemaEmpty(shape.user.schemas[0]);
    store.notesCreated[_id] = true;
    store.noteId = _id;
    store.edit = true;
  });
}

export function onChange(_id: string, key: string, value: string | string[]) {
  tree.update(store => {
    if (store.notesUpdated[_id]) {
      store.notesUpdated[_id][key] = value;
    } else {
      store.notesUpdated[_id] = {[key]: value};
    }
  });
}

export function onChangePassword(old: string, new1: string, new2: string) {
  toast('info', 'Changing password...');

  return call('POST', '/api/users/password', {
    new1: hash(new1),
    new2: hash(new2),
    old: hash(old)
  }).then(() => {
    toast('success', 'Changed password.');
  });
}

export function onChangeSchema(_id: string, schema: SchemaType<>) {
  tree.update((store, shape) => {
    const doc = shape.notes.find(note => note._id === _id);
    if (!doc) return;

    store.notesUpdated[_id] = Object.keys(schema.fields).reduce(
      (clone, field) =>
        doc._outline[field] && typeof clone[field] === typeof doc[field]
          ? Object.assign(clone, {[field]: doc[field]})
          : clone,
      schemaEmpty(schema)
    );
  });
}

export function onEdit() {
  tree.update(store => {
    store.edit = !store.edit;
  });

  onReset();
}

export function onExport(data: string, extension: string) {
  const link = document.createElement('a');
  const type = `application/${extension}`;
  const url = URL.createObjectURL(new Blob([data], {type}));

  link.href = url;
  link.download = `docteer-${tree
    .state()
    .last.toJSON()
    .slice(0, 16)
    .replace(/[:-]/g, '_')
    .replace('T', '-')}.${extension}`;
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

export function onExportCSV() {
  const items = tree.state().notesOrigins;
  const data = new Array(items.length);
  const keys = [];

  let parse: string => string;
  try {
    const parser = new DOMParser();
    parse = text => {
      const body = parser.parseFromString(text, 'text/html').body;
      return body ? body.textContent || '' : '';
    };
  } catch (error) {
    parse = text => text;
  }

  items.forEach((item, index) => {
    Object.keys(item).forEach(key => {
      if (!key.startsWith('_') && !keys.includes(key)) keys.push(key);

      data[index] = keys
        .map(key => [].concat(item[key]).join('\n'))
        .map(parse)
        .map(value => `"${value.replace(/"/g, '\\"')}"`)
        .join(';');
    });
  });

  onExport(`${keys.join(';')}\n${data.join('\n')}`, 'csv');
}

export function onExportJSON() {
  onExport(JSON.stringify(tree.state().notesOrigins), 'json');
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
        tree.update(store => {
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

              if (row._outline[key] === undefined) {
                delete row[key];
                return;
              }

              throw new Error();
            });

            Object.keys(row._outline).forEach(key => {
              if (row[key] === undefined) throw new Error();
            });

            if (!store.notesOrigins.some(note => note._id === row._id))
              created[row._id] = true;

            updated[row._id] = row;
          });

          store.edit = true;
          store.view = 'notes';
          Object.assign(store.notesCreated, created);
          Object.assign(store.notesUpdated, updated);
        });

        toast('success', 'Imported.');
      } catch (error) {
        toast('error', 'Import error.');
      }

      remove();
    };
  }
}

export function onLogin(email: string, password: string) {
  toast('info', 'Logging in...');

  return call('POST', '/api/users/login', {email, password: hash(password)})
    .then(login)
    .then(() => {
      toast('success', 'Logged in.');
      tree.updateWith({view: 'notes'});
    })
    .then(() => onRefresh(true));
}

export function onLoginWithToken(token: string, skipRefresh?: boolean) {
  if (!token) return Promise.reject();

  return call('GET', '/api/users/token', {}, {silent: true, token})
    .then(userData => login(userData, skipRefresh))
    .then(() => (skipRefresh ? undefined : onRefresh(true)));
}

export function onLogout() {
  toast('info', 'Logging out...');

  tree.updateWith({
    notesOrigins: [],
    userData: null,
    userDiff: null,
    view: 'login'
  });

  toast('success', 'Logged out.');
}

export function onRefresh(firstRun: ?boolean) {
  toast('info', firstRun === true ? 'Loading...' : 'Refreshing...');

  const last = new Date();
  return call('GET', '/api/notes', {refresh: +tree.state().last}).then(
    // $FlowFixMe
    (patch: PatchType<>) => {
      tree.updateWith({last});
      toast('success', firstRun === true ? 'Loaded.' : 'Refreshed.');
      merge(patch);
    }
  );
}

export function onRemove() {
  tree.update(store => {
    if (!store.noteId) return;
    store.notesRemoved[store.noteId] = true;
    store.noteId = null;
  });
}

export function onReset() {
  tree.update(store => {
    if (store.noteId && store.notesCreated[store.noteId]) store.noteId = null;

    store.notesCreated = {};
    store.notesRemoved = {};
    store.notesUpdated = {};
  });
}

export function onSave() {
  tree.updateWith({edit: false});

  const {
    last: refresh,
    notesCreated: created,
    notesRemoved: removed,
    notesUpdated: updated
  } = tree.state();

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

  return call('POST', '/api/notes', {patch, refresh: +refresh}).then(
    // $FlowFixMe
    (patch: PatchType<>) => {
      tree.updateWith({last});
      toast('success', 'Saved.');
      merge(patch);
      onReset();
    },
    error => {
      tree.updateWith({edit: true});
      throw error;
    }
  );
}

export function onSchemaAdd() {
  tree.update((store, shape) => {
    if (shape.user === null) return;
    if (store.userDiff === null) store.userDiff = {};
    if (store.userDiff.schemas === undefined) store.userDiff.schemas = [];

    store.userDiff.schemas.push({
      name: `Schema ${shape.user.schemas.length + 1}`,
      fields: {name: 'div', labels: 'ul'}
    });
  });
}

export function onSchemaDelete(event: EventType) {
  const name = event.target.parentNode.dataset.name;
  const index = +event.target.parentNode.dataset.index;

  tree.update((store, shape) => {
    if (shape.user === null) return;

    const schema = shape.user.schemas.find(schema => schema.name === name);
    if (schema === undefined || store.userDiff === null) return;

    const diff = store.userDiff.schemas.find(schema => schema.name === name);
    if (diff === undefined) return;

    const fields = schema.fields;
    delete diff.fields[Object.keys(fields)[index]];
  });
}

export function onSchemaField(event: EventType) {
  const name = event.target.parentNode.dataset.name;

  tree.update((store, shape) => {
    if (shape.user === null) return;

    const schema = shape.user.schemas.find(schema => schema.name === name);
    if (schema === undefined || store.userDiff === null) return;

    const diff = store.userDiff.schemas.find(schema => schema.name === name);
    if (diff === undefined) return;

    const fields = schema.fields;
    diff.fields[`_${Object.keys(fields).length}`] = 'div';
  });
}

export function onSchemaKey(event: EventType) {
  const name = event.target.parentNode.dataset.name;
  const value = event.target.value;
  const index = +event.target.parentNode.dataset.index;

  tree.update((store, shape) => {
    if (shape.user === null) return;

    const schema = shape.user.schemas.find(schema => schema.name === name);
    if (schema === undefined || store.userDiff === null) return;

    const diff = store.userDiff.schemas.find(schema => schema.name === name);
    if (diff === undefined) return;

    const fields = schema.fields;
    const type = diff.fields[Object.keys(fields)[index]];
    delete diff.fields[Object.keys(fields)[index]];
    diff.fields[value] = type;
  });
}

export function onSchemaName(event: EventType) {
  const name = event.target.parentNode.dataset.name;
  const value = event.target.value;

  tree.update(store => {
    if (store.userDiff === null) return;

    const diff = store.userDiff.schemas.find(schema => schema.name === name);
    if (diff === undefined) return;

    diff.name = value;
  });
}

export function onSchemaOrder(event: EventType) {
  const name = event.target.parentNode.dataset.name;
  const index = +event.target.parentNode.dataset.index;
  const order = +event.target.dataset.order;

  tree.update((store, shape) => {
    if (shape.user === null) return;

    const schema = shape.user.schemas.find(schema => schema.name === name);
    if (schema === undefined || store.userDiff === null) return;

    const diff = store.userDiff.schemas.find(schema => schema.name === name);
    if (diff === undefined) return;

    const fields = Object.keys(schema.fields);
    fields[index] = fields.splice(index + order, 1, fields[index])[0];

    diff.fields = fields.reduce(
      (next, key) => Object.assign(next, {[key]: schema.fields[key]}),
      {}
    );
  });
}

export function onSchemaRemove(event: EventType) {
  const name = event.target.parentNode.dataset.name;

  tree.update(({userDiff}) => {
    if (userDiff && userDiff.schemas) {
      const index = userDiff.schemas.findIndex(schema => schema.name === name);
      userDiff.schemas.splice(index, 1);
    }
  });
}

export function onSchemaType(event: EventType) {
  const name = event.target.parentNode.dataset.name;
  const field = event.target.parentNode.dataset.field;
  const value = event.target.value;

  tree.update(store => {
    if (store.userDiff === null) return;

    const diff = store.userDiff.schemas.find(schema => schema.name === name);
    if (diff === undefined) return;

    diff.fields[field] = value;
  });
}

export function onSearch(event: InputEventType) {
  tree.updateWith({search: event.target.value});
}

export function onSettingsReset() {
  tree.update(store => {
    store.userDiff = store.userData ? {schemas: store.userData.schemas} : null;
  });
}

export function onSettingsSave() {
  toast('info', 'Saving...');

  return call('POST', '/api/users/settings', tree.state().userDiff).then(
    userData => {
      toast('success', 'Saved.');
      tree.update(store => {
        Object.assign(store.userData, userData);
      });
      onSettingsReset();
    }
  );
}

export function onSignup(email: string, password: string) {
  toast('info', 'Signing up...');

  return call('POST', '/api/users/register', {
    email,
    password: hash(password)
  })
    .then(login)
    .then(() => {
      toast('success', 'Signed in.');
      tree.updateWith({noteId: 'introduction'});
    })
    .then(() => onRefresh(true));
}

export function onTypeAhead(event: InputEventType) {
  if (event.target.__skip) return;

  const selection = window.getSelection();
  const focusNode = selection.focusNode;
  const search = focusNode.wholeText && focusNode.wholeText.trim();

  if (search) {
    const names = tree
      .state()
      .labels.map(label => label.name)
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

function call(method: 'GET' | 'POST', path, data, {silent, token} = {}) {
  const headers = new Headers({'Content-Type': 'application/json'});
  const url = new URL(path, location.origin);

  let body;
  if (method === 'GET') {
    for (const [key, value] of Object.entries(data))
      url.searchParams.append(key, String(value));
  } else {
    body = JSON.stringify(data);
  }

  const auth = token || tree.state().userToken;
  if (auth) headers.append('Authorization', `Bearer ${auth}`);

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
        if (!silent) toast('error', error);
        reject(error);
      } else {
        resolve(response);
      }
    }
  });
}

function login(userData = null, skipRefresh) {
  const diff: $Shape<StoreType> = {last: new Date(0), userData};
  if (!skipRefresh && userData) diff.userDiff = {schemas: userData.schemas};
  tree.updateWith(diff);
}

function merge(diff) {
  tree.update(store => {
    store.notesOrigins = store.notesOrigins
      .filter(note => !diff.removed.includes(note._id))
      .concat(diff.created.map(_id => ({_id})))
      .filter(
        (note, index, notes) =>
          notes.findIndex(other => other._id === note._id) === index
      )
      .map(note => {
        const patch = diff.updated.find(updated => updated._id === note._id);
        return patch ? Object.assign({}, note, patch) : note;
      });
  });
}

let toastId = 0;
function toast(type, message) {
  const _id = toastId++;
  const text =
    message instanceof Error // $FlowFixMe
      ? message.code // $FlowFixMe
        ? message.text
        : message.message
      : message;

  tree.update(store => {
    store.toasts.push({
      _id,
      dead: false,
      marked: type === 'info',
      text,
      type
    });
  });

  if (type === 'info') {
    tree.update(store => {
      ++store.pend;
    });
  } else {
    const toast = tree.state().toasts.find(toast => toast.marked);
    if (!toast) return;
    const info = toast._id;

    tree.update(store => {
      const toast = store.toasts.find(toast => toast._id === info);
      if (toast) toast.marked = false;
    });

    setTimeout(() => {
      tree.update(store => {
        --store.pend;
      });
    }, 500);

    setTimeout(() => {
      tree.update(store => {
        const toast = store.toasts.find(toast => toast._id === info);
        if (toast) toast.dead = true;
      });
    }, 1000);

    setTimeout(() => {
      tree.update(store => {
        const toast = store.toasts.find(toast => toast._id === _id);
        if (toast) toast.dead = true;
      });
    }, 1250);

    setTimeout(() => {
      tree.update(({toasts}) => {
        for (let index = toasts.length - 1; index >= 0; --index) {
          const toastId = toasts[index]._id;
          if (toastId === _id || toastId === info) toasts.splice(index, 1);
        }
      });
    }, 1500);
  }
}
