// @flow

import {produce} from 'immer';

import {storeToShape} from '@client/state';

import type {ShapeType} from '@types';
import type {StoreType} from '@types';
import type {StateType} from '@types';

let _shape: ShapeType;
let _state: StateType;
let _store: StoreType;

const _watchers = [];

write({
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
});

export function off(fn: ($ReadOnly<StateType>) => void) {
  _watchers.splice(_watchers.indexOf(fn), 1);
}

export function on(fn: ($ReadOnly<StateType>) => void) {
  _watchers.push(fn);
}

export function state(): $ReadOnly<StateType> {
  return _state;
}

export function update(action: (StoreType, $ReadOnly<ShapeType>) => void) {
  const nextStore = produce(_store, store => action(store, _shape));
  if (nextStore !== _store) write(nextStore);
}

export function updateWith(diff: $Shape<StoreType>) {
  update(store => {
    Object.assign(store, diff);
  });
}

export function write(store: StoreType) {
  _store = store;
  _shape = storeToShape(_store);
  _state = {..._shape, ..._store};
  _watchers.forEach(fn => fn(_state));
}
