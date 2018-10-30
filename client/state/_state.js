// @flow

import {produce} from 'immer';
import {setAutoFreeze} from 'immer';

import {storeToShape} from '@client/state';

import type {ShapeType} from '@types';
import type {StoreType} from '@types';
import type {StateType} from '@types';

setAutoFreeze(process.env.NODE_ENV === 'development');

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
    const nextStore = produce(store, store => action(store, shape));
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
