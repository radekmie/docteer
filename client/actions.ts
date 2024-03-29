import fuzzysort from 'fuzzysort';

import { hash, schemaEmpty } from '../shared';
import {
  APIEndpoints,
  APIEndpointParams,
  APIEndpointResult,
  NotePatchType,
  NoteType,
  PatchType,
  SchemaOutlineFieldType,
  SchemaType,
  ShapeType,
  StoreType,
} from '../types';
import * as tree from './state';

// Publish tree.
if (typeof window !== 'undefined') {
  window.__DOCTEER_STATE__ = tree;
}

export function onAdd() {
  create((_, { user }) => (user ? schemaEmpty(user.schemas[0]) : undefined));
}

export function onClone() {
  // FIXME: Implement type-safe `NoteType` => `Exclude<NotePatchType, '_id'>`.
  create((_, { note }: { note: any }) => {
    if (note) {
      note = Object.assign({}, note);
      delete note._created;
      delete note._id;
      delete note._removed;
      delete note._updated;
    }

    return note;
  });
}

export function onChange(_id: string, key: string, value: string | string[]) {
  tree.update(store => {
    if (store.notesUpdated[_id]) {
      store.notesUpdated[_id][key] = value;
    } else {
      store.notesUpdated[_id] = { [key]: value } as NotePatchType;
    }
  });
}

export function onChangePassword(old: string, new1: string, new2: string) {
  toast('info', 'Changing password...');

  return call('POST /users/password', {
    new1: hash(new1),
    new2: hash(new2),
    old: hash(old),
  }).then(() => {
    toast('success', 'Changed password.');
  });
}

export function onChangeSchema(_id: string, schema: SchemaType) {
  tree.update((store, shape) => {
    const doc = shape.notes.find(note => note._id === _id);
    if (!doc) {
      return;
    }

    store.notesUpdated[_id] = schema.fields.reduce(
      (clone, { name }) =>
        typeof clone[name] === typeof doc[name]
          ? Object.assign(clone, { [name]: doc[name] })
          : clone,
      schemaEmpty(schema),
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
  const url = URL.createObjectURL(new Blob([data], { type }));

  link.href = url;
  link.download = `docteer-${tree
    .state()
    .last.toJSON()
    .slice(0, 16)
    .replace(/[:-]/g, '_')
    .replace('T', '-')}.${extension}`;
  link.style.display = 'none';

  document.body.appendChild(link);

  link.click();

  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 0);
}

export function onExportCSV() {
  const items = tree.state().notesOrigins;
  const data = new Array(items.length);
  const keys: string[] = [];

  let parse: (arg0: string) => string;
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
      if (!key.startsWith('_') && !keys.includes(key)) {
        keys.push(key);
      }

      data[index] = keys
        // @ts-expect-error Unknown object.
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

  document.body.appendChild(input);

  input.click();
  input.addEventListener('change', uploaded, false);

  function remove() {
    document.body.removeChild(input);
  }

  const removeDelay = setTimeout(remove, 60 * 1000);

  function uploaded() {
    const reader = new FileReader();

    clearTimeout(removeDelay);

    toast('info', 'Importing...');
    reader.readAsText(input.files![0]);
    reader.onerror = () => {
      toast('error', 'Import error.');
    };
    reader.onload = () => {
      try {
        tree.update(store => {
          const created: Record<string, boolean> = {};
          const updated: Record<string, NotePatchType> = {};

          JSON.parse(reader.result as string).forEach((row: NoteType) => {
            if (
              typeof row._id !== 'string' ||
              row._id.length === 0 ||
              row._id.length > 100 ||
              row._outline === undefined ||
              row._outname === undefined ||
              typeof row._outname !== 'string' ||
              !Array.isArray(row._outline) ||
              row._outline.some(
                field =>
                  row[field.name] === undefined ||
                  typeof field.name !== 'string' ||
                  !/^[^$_][^.]*$/.test(field.name) ||
                  !['div', 'ol', 'textarea', 'ul'].includes(field.type) ||
                  Object.keys(field).length !== 2,
              )
            ) {
              throw new Error();
            }

            Object.keys(row).forEach(key => {
              if (key.startsWith('_')) {
                if (key !== '_id' && key !== '_outline' && key !== '_outname') {
                  throw new Error();
                }
                return;
              }

              const field = row._outline.find(field => field.name === key);
              if (field === undefined) {
                delete row[key];
                return;
              }

              if (field.type === 'div' && typeof row[key] === 'string') {
                return;
              }
              if (
                (field.type === 'ol' || field.type === 'ul') &&
                // @ts-expect-error Unknown object.
                row[key].every(line => typeof line === 'string')
              ) {
                return;
              }

              throw new Error();
            });

            if (!store.notesOrigins.some(note => note._id === row._id)) {
              created[row._id] = true;
            }
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

  return call('POST /users/login', { email, password: hash(password) })
    .then(login)
    .then(() => {
      toast('success', 'Logged in.');
      tree.updateWith({ view: 'notes' });
    })
    .then(() => onRefresh(true));
}

export function onLoginWithToken(token: string, skipRefresh?: boolean) {
  if (!token) {
    return Promise.reject();
  }

  return call('POST /users/token', {}, { silent: true, token })
    .then(userData => login(userData, skipRefresh))
    .then(() => (skipRefresh ? undefined : onRefresh(true)));
}

export function onLogout() {
  toast('info', 'Logging out...');

  tree.updateWith({
    notesOrigins: [],
    userData: null,
    userDiff: null,
    view: 'login',
  });

  toast('success', 'Logged out.');
}

export function onRefresh(firstRun?: boolean) {
  toast('info', firstRun === true ? 'Loading...' : 'Refreshing...');

  return call('GET /notes', { refresh: +tree.state().last }).then(result => {
    tree.updateWith({ last: new Date(result.refresh) });
    toast('success', firstRun === true ? 'Loaded.' : 'Refreshed.');
    merge(result.patch);
  });
}

export function onRemove() {
  tree.update(store => {
    if (!store.noteId) {
      return;
    }

    store.notesRemoved[store.noteId] = true;
    store.noteId = null;
  });
}

export function onReset() {
  tree.update(store => {
    const noteId = store.noteId;
    if (noteId && !store.notesOrigins.some(note => note._id === noteId)) {
      store.noteId = null;
    }

    store.notesCreated = {};
    store.notesRemoved = {};
    store.notesUpdated = {};
  });
}

export function onSave() {
  tree.updateWith({ edit: false });

  const {
    last: refresh,
    notesCreated: created,
    notesRemoved: removed,
    notesUpdated: updated,
  } = tree.state();

  const patch = {
    created: Object.keys(created),
    removed: Object.keys(removed),
    updated: Object.keys(updated).map(_id =>
      Object.assign({ _id }, updated[_id]),
    ),
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

  return call('POST /notes', { patch, refresh: +refresh }).then(
    result => {
      tree.updateWith({ last: new Date(result.refresh) });
      toast('success', 'Saved.');
      merge(result.patch);
      onReset();
    },
    error => {
      tree.updateWith({ edit: true });
      throw error;
    },
  );
}

export function onSchemaAdd() {
  tree.update((store, shape) => {
    if (shape.user === null) {
      return;
    }

    if (store.userDiff === null) {
      store.userDiff = { schemas: [] };
    }

    store.userDiff.schemas.push({
      name: `Schema ${shape.user.schemas.length + 1}`,
      fields: [
        { name: 'name', type: 'div' },
        { name: 'labels', type: 'ul' },
      ],
    });
  });
}

export function onSchemaDelete(event: Event) {
  const { index, name } = getSchemaInfo(event);

  tree.update((store, shape) => {
    if (shape.user === null) {
      return;
    }

    const schema = shape.user.schemas.find(schema => schema.name === name);
    if (schema === undefined || store.userDiff === null) {
      return;
    }

    const diff = store.userDiff.schemas.find(schema => schema.name === name);
    if (diff === undefined) {
      return;
    }

    diff.fields.splice(index, 1);
  });
}

export function onSchemaField(event: Event) {
  const { name } = getSchemaInfo(event);

  tree.update((store, shape) => {
    if (shape.user === null) {
      return;
    }

    const schema = shape.user.schemas.find(schema => schema.name === name);
    if (schema === undefined || store.userDiff === null) {
      return;
    }

    const diff = store.userDiff.schemas.find(schema => schema.name === name);
    if (diff === undefined) {
      return;
    }

    diff.fields.push({ name: `_${schema.fields.length}`, type: 'div' });
  });
}

export function onSchemaKey(event: Event) {
  const { index, name, value } = getSchemaInfo(event);

  tree.update((store, shape) => {
    if (shape.user === null) {
      return;
    }

    const schema = shape.user.schemas.find(schema => schema.name === name);
    if (schema === undefined || store.userDiff === null) {
      return;
    }

    const diff = store.userDiff.schemas.find(schema => schema.name === name);
    if (diff === undefined) {
      return;
    }

    diff.fields[index].name = value;
  });
}

export function onSchemaName(event: Event) {
  const { name, value } = getSchemaInfo(event);

  tree.update(store => {
    if (store.userDiff === null) {
      return;
    }

    const diff = store.userDiff.schemas.find(schema => schema.name === name);
    if (diff === undefined) {
      return;
    }

    diff.name = value;
  });
}

export function onSchemaOrder(event: Event) {
  const { index, order, name } = getSchemaInfo(event);

  tree.update((store, shape) => {
    if (shape.user === null) {
      return;
    }

    const schema = shape.user.schemas.find(schema => schema.name === name);
    if (schema === undefined || store.userDiff === null) {
      return;
    }

    const diff = store.userDiff.schemas.find(schema => schema.name === name);
    if (diff === undefined) {
      return;
    }

    const fields = diff.fields;
    fields.splice(index, 1, fields.splice(index + order, 1, fields[index])[0]);
  });
}

export function onSchemaRemove(event: Event) {
  const { name } = getSchemaInfo(event);

  tree.update(({ userDiff }) => {
    if (userDiff && userDiff.schemas) {
      const index = userDiff.schemas.findIndex(schema => schema.name === name);
      userDiff.schemas.splice(index, 1);
    }
  });
}

export function onSchemaType(event: Event) {
  const { index, name, value } = getSchemaInfo(event);

  tree.update(store => {
    if (store.userDiff === null) {
      return;
    }

    const diff = store.userDiff.schemas.find(schema => schema.name === name);
    if (diff === undefined) {
      return;
    }

    diff.fields[index].type = value;
  });
}

export function onSearch(event: InputEvent) {
  tree.updateWith({ search: event.target!.value as string });
}

export function onSettingsReset() {
  tree.update(store => {
    store.userDiff = store.userData
      ? { schemas: store.userData.schemas }
      : null;
  });
}

export function onSettingsSave() {
  const userDiff = tree.state().userDiff;
  if (userDiff === null) {
    return Promise.resolve();
  }

  toast('info', 'Saving...');

  return call('POST /users/settings', userDiff).then(userData => {
    toast('success', 'Saved.');
    tree.update(store => {
      Object.assign(store.userData, userData);
    });
    onSettingsReset();
  });
}

export function onSignup(email: string, password: string) {
  toast('info', 'Signing up...');

  return call('POST /users/register', {
    email,
    password: hash(password),
  })
    .then(login)
    .then(() => {
      toast('success', 'Signed in.');
      tree.updateWith({ noteId: 'introduction' });
    })
    .then(() => onRefresh(true));
}

export function onTypeAhead(event: InputEvent) {
  if (event.target!.__skip) {
    return;
  }

  const selection = window.getSelection()!;
  const focusNode = selection.focusNode!;
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
        event.target!.__skip = true;

        document.execCommand('insertText', true, label);
        selection.setBaseAndExtent(
          focusNode,
          start,
          focusNode,
          focusNode.length!,
        );
      }
    }
  }
}

onTypeAhead.pre = (event: KeyboardEvent) => {
  event.target!.__skip =
    event.ctrlKey || event.metaKey || !event.key || event.key.length !== 1;
};

onTypeAhead.post = (event: KeyboardEvent) => {
  event.target!.__skip = true;
};

function call<Endpoint extends keyof APIEndpoints>(
  endpoint: Endpoint,
  params: APIEndpointParams<Endpoint>,
  { silent, token }: { silent?: boolean; token?: string } = {},
) {
  const [method, path] = endpoint.split(' ');
  const headers = new Headers({ 'Content-Type': 'application/json' });
  const url = new URL(`/api${path}`, location.origin);

  let body: string;
  if (method === 'GET') {
    for (const [key, value] of Object.entries(params as object)) {
      url.searchParams.append(key, String(value));
    }
  } else {
    body = JSON.stringify(params);
  }

  const auth = token || tree.state().userToken;
  if (auth) {
    headers.append('Authorization', `Bearer ${auth}`);
  }

  return new Promise<APIEndpointResult<Endpoint>>((resolve, reject) => {
    const id = setTimeout(done, 5000, new Error('Sorry, try again later.'));

    fetch(url.toString(), { body, headers, method })
      .then(response => {
        if (!response.ok) {
          throw new Error();
        }
        return response.json();
      })
      .then(response => {
        if (response.error) {
          throw Object.assign(new Error(), response.error);
        }
        return response.result;
      })
      .then(response => done(null, response), done);

    function done(error: Error | null, response?: APIEndpointResult<Endpoint>) {
      clearTimeout(id);

      if (error) {
        if (!silent) {
          toast('error', error);
        }
        reject(error);
      } else if (response) {
        // FIXME: Above assertion is superficial, but overloaded `done` is not enough.
        resolve(response);
      }
    }
  });
}

function create(
  make: (
    store: StoreType,
    shape: Readonly<ShapeType>,
  ) => NotePatchType | null | undefined,
) {
  const notes = tree.state().notes;

  let _id: string;
  do {
    _id = Math.random().toString(36).substr(2, 6);
  } while (notes.some(note => note._id === _id));

  tree.update((store, shape) => {
    const instance = make(store, shape);
    if (!instance) {
      return;
    }

    store.notesUpdated[_id] = instance;
    store.notesCreated[_id] = true;
    store.noteId = _id;
    store.edit = true;
  });
}

function getSchemaInfo({ target }: Event) {
  const parentDataset = target!.parentNode!.dataset!;
  return {
    index: +parentDataset.index!,
    name: parentDataset.name,
    order: +target!.dataset!.order!,
    value: target!.value as SchemaOutlineFieldType,
  };
}

function login(
  userData: APIEndpointResult<'POST /users/login'> | null = null,
  skipRefresh?: boolean,
) {
  const diff: Partial<StoreType> = { last: new Date(0), userData };
  if (!skipRefresh && userData) {
    diff.userDiff = { schemas: userData.schemas };
  }
  tree.updateWith(diff);
}

function merge({ created, removed, updated }: PatchType) {
  if (created.length === 0 && removed.length === 0 && updated.length === 0) {
    return;
  }

  tree.update(store => {
    store.notesOrigins = store.notesOrigins
      .filter(note => !removed.includes(note._id))
      .concat(created.map(_id => ({ _id } as NoteType)))
      .filter(
        (note, index, notes) =>
          notes.findIndex(other => other._id === note._id) === index,
      )
      .map(note => {
        const diff = updated.find(updated => updated._id === note._id);
        return diff ? Object.assign({}, note, diff) : note;
      });
  });
}

let toastId = 0;
function toast(type: 'error' | 'info' | 'success', message: Error | string) {
  const _id = toastId++;
  const text =
    message instanceof Error
      ? message.code
        ? message.text!
        : message.message
      : message;

  tree.update(store => {
    store.toasts.push({
      _id,
      dead: false,
      marked: type === 'info',
      text,
      type,
    });
  });

  if (type === 'info') {
    tree.update(store => {
      ++store.pend;
    });
  } else {
    const toast = tree.state().toasts.find(toast => toast.marked);
    if (!toast) {
      return;
    }

    const info = toast._id;

    tree.update(store => {
      const toast = store.toasts.find(toast => toast._id === info);
      if (toast) {
        toast.marked = false;
      }
    });

    setTimeout(() => {
      tree.update(store => {
        --store.pend;
      });
    }, 500);

    setTimeout(() => {
      tree.update(store => {
        const toast = store.toasts.find(toast => toast._id === info);
        if (toast) {
          toast.dead = true;
        }
      });
    }, 1000);

    setTimeout(() => {
      tree.update(store => {
        const toast = store.toasts.find(toast => toast._id === _id);
        if (toast) {
          toast.dead = true;
        }
      });
    }, 1250);

    setTimeout(() => {
      tree.update(({ toasts }) => {
        for (let index = toasts.length - 1; index >= 0; --index) {
          const toastId = toasts[index]._id;
          if (toastId === _id || toastId === info) {
            toasts.splice(index, 1);
          }
        }
      });
    }, 1500);
  }
}
