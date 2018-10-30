// @flow

import immer from 'immer';

import {storeToShape} from '@client/state';

import type {ShapeType} from '@types';
import type {StoreType} from '@types';
import type {StateType} from '@types';

type TreePathPartType = number | string | {[string]: number | string};
type TreePathType = TreePathPartType[];

const initialStore: StoreType = {
  notesOrigins: [],
  notesCreated: {},
  notesRemoved: {},
  notesUpdated: {},

  noteId: null,

  load: 1,
  pend: 1,

  filter: [],
  search: '',
  toasts: [],

  edit: false,
  help: false,
  last: new Date(0),
  view: '',

  userData: null,
  userDiff: null
};

let store: StoreType = initialStore;
let shape: ShapeType = storeToShape(store);
let state: StateType = {...shape, ...store};

export const tree = {
  // Old API
  _get(path: TreePathType) {
    let object = state;
    const length = path.length;
    for (let index = 0; index < length; ++index) {
      if (!object) return undefined;
      const part = path[index];
      if (typeof part === 'object') {
        if (!Array.isArray(object)) return undefined;
        object = object.find(item => {
          for (const key in part)
            if (key in item && part[key] === item[key]) return true;
          return false;
        });
      } else {
        object = object[part];
      }
    }

    return object;
  },
  _set(path: TreePathType, value: mixed) {
    tree.update(store => {
      let object = store;
      const length = path.length;
      for (let index = 0; index < length - 1; ++index) {
        const part = path[index];
        if (typeof part === 'object') {
          if (!Array.isArray(object)) throw new Error();
          object = object.find(item => {
            for (const key in part)
              if (key in item && part[key] === item[key]) return true;
            return false;
          });
          if (object === undefined) throw new Error();
        } else {
          if (object[part] === undefined)
            object[part] = typeof path[index + 1] === 'number' ? [] : {};
          object = object[part];
        }
      }

      if (typeof path[length - 1] === 'object') {
        if (value !== undefined) throw new Error(path);
        // $FlowFixMe
        const index = object.findIndex(item => {
          // $FlowFixMe
          for (const key in path[length - 1]) // $FlowFixMe
            if (key in item && path[length - 1][key] === item[key]) return true;
          return false;
        });
        // $FlowFixMe
        object.splice(index, 1);
      } else {
        // $FlowFixMe
        object[path[length - 1]] = value;
      }
    });
  },

  // New API
  _watchers: [],

  off(fn: ($ReadOnly<StateType>) => void) {
    tree._watchers.splice(tree._watchers.indexOf(fn), 1);
  },
  on(fn: ($ReadOnly<StateType>) => void) {
    tree._watchers.push(fn);
  },

  state(): $ReadOnly<StateType> {
    return state;
  },

  update(action: (StoreType, $ReadOnly<ShapeType>) => void) {
    const prevStore = store;
    const nextStore = immer(store, store => action(store, shape));
    if (prevStore === nextStore) return;
    store = nextStore;
    shape = storeToShape(store);
    state = {...shape, ...store};

    tree._watchers.forEach(fn => fn(state));
  },

  updateWith(diff: $Shape<StoreType>) {
    tree.update(store => {
      Object.assign(store, diff);
    });
  }
};
