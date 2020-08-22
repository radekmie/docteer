import fuzzysort from 'fuzzysort';
import { produce } from 'immer';

import { compare, compareDocs, pure } from '../shared';
import {
  NotePatchType,
  NoteType,
  ShapeType,
  StateType,
  StoreType,
  UserType,
} from '../types';

// Definition.
let _shape: ShapeType;
let _state: StateType;
let _store: StoreType;

type Watcher = (state: Readonly<StateType>) => void;

const _watchers: Watcher[] = [];

// Public API.
export function off(fn: Watcher) {
  _watchers.splice(_watchers.indexOf(fn), 1);
}

export function on(fn: Watcher) {
  _watchers.push(fn);
}

export function shape(): Readonly<ShapeType> {
  return _shape;
}

export function state(): Readonly<StateType> {
  return _state;
}

export function update(
  action: (store: StoreType, shape: Readonly<ShapeType>) => void,
) {
  const nextStore = produce(_store, store => action(store, _shape));
  if (nextStore !== _store) {
    write(nextStore);
  }
}

export function updateWith(diff: Partial<StoreType>) {
  update(store => {
    Object.assign(store, diff);
  });
}

// Private API.
function storeToShape({
  filter,
  noteId,
  notesCreated,
  notesOrigins,
  notesRemoved,
  notesUpdated,
  search,
  userData,
  userDiff,
  view,
}: Readonly<StoreType>): ShapeType {
  const notes = _notes(notesOrigins, notesCreated, notesRemoved, notesUpdated);
  const notesFiltered = _notesFiltered(notes, filter, search);

  return {
    href: _href(view, noteId, filter, search),
    labels: _labels(notes, notesFiltered, filter, search),
    note: _note(notes, noteId),
    notes,
    notesFiltered,
    notesVisible: _notesVisible(notesFiltered, noteId, filter, search),
    user: _user(userData, userDiff),
    userLoggedIn: _userLoggedIn(userData),
    userToken: _userToken(userData),
  };
}

function write(store: StoreType) {
  _store = store;
  _shape = storeToShape(_store);
  _state = { ..._shape, ..._store };
  _watchers.forEach(fn => fn(_state));
}

// Helpers.
function _href(
  view: string,
  noteId: string | false | null,
  filter: string[],
  search: string,
) {
  let path = '/';
  if (view) {
    path += view;
    if (noteId) {
      path += `/${noteId}`;
    }
  }

  return path + _query(filter, search);
}

function _query(filter: string[], search: string) {
  const query = [];
  if (filter.length) {
    query.push(`filter=${filter.join()}`);
  }

  if (search.length) {
    query.push(`search=${search}`);
  }

  return '?' + query.join('&');
}

function _userLoggedIn(data: UserType | null) {
  return !!data;
}

function _userToken(data: UserType | null) {
  return data && data.token;
}

const _labels = pure(
  (
    notes: NoteType[],
    notesFiltered: NoteType[],
    filter: string[],
    search: string,
  ) => {
    const labels = Object.create(null);
    const labelsList: {
      active: boolean;
      count: number;
      href: string;
      name: string;
      total: number;
    }[] = [];

    notes.forEach(note => {
      // @ts-expect-error Unknown object.
      note.labels.forEach(name => {
        if (name in labels) {
          labels[name].total++;
        } else if (name) {
          const active = filter.includes(name);
          const toggle = active
            ? filter.filter(filter => filter !== name)
            : filter.concat(name);

          labels[name] = {
            active,
            count: 0,
            href: _query(toggle.sort(compare), search),
            name,
            total: 1,
          };

          labelsList.push(labels[name]);
        }
      });
    });

    notesFiltered.forEach(note => {
      // @ts-expect-error Unknown object.
      note.labels.forEach(name => {
        if (name in labels) {
          labels[name].count++;
        }
      });
    });

    return labelsList.sort(compareDocs);
  },
);

const _note = pure((notes: NoteType[], noteId: string | null) => {
  return notes.find(note => note._id === noteId) || null;
});

const _notes = pure(
  (
    origins: NotePatchType[],
    created: Record<string, true>,
    removed: Record<string, true>,
    updated: Record<string, NotePatchType>,
  ) => {
    return (
      origins
        // @ts-expect-error Unknown object.
        .concat(Object.keys(created).map(_id => ({ _created: true, _id })))
        .map(note => ({
          _removed: !!removed[note._id],
          _updated: !!updated[note._id],
          ...note,
          ...updated[note._id],
        }))
        // @ts-expect-error Unknown object.
        .sort(compareDocs) as NoteType[]
    );
  },
);

type NoteWithMatch = { match: Fuzzysort.Result; note: NoteType };

const _notesFiltered = pure(
  (notes: NoteType[], filter: string[], search: string) => {
    if (filter.length) {
      notes = notes.filter(note =>
        filter.every(filter =>
          // @ts-expect-error Unknown object.
          note.labels.some(label => label === filter),
        ),
      );
    }

    const term = search.trim();
    if (term === '') {
      return notes;
    }

    return notes
      .reduce((notes, note) => {
        // @ts-expect-error Unknown object.
        const match = fuzzysort.single(term, note.name);
        if (match) {
          notes.push({ match, note });
        }
        return notes;
      }, [] as NoteWithMatch[])
      .sort(_notesResultOrder)
      .slice(0, 50)
      .map(_notesResultMapper);
  },
);

const _notesResultMapper = (single: NoteWithMatch) =>
  Object.assign({}, single.note, { name: fuzzysort.highlight(single.match) });

const _notesResultOrder = (a: NoteWithMatch, b: NoteWithMatch) =>
  // @ts-expect-error Unknown object.
  b.match.score - a.match.score || compareDocs(a.note, b.note);

const _notesVisible = pure(
  (
    notes: NoteType[],
    noteId: string | null,
    filter: string[],
    search: string,
  ) => {
    return notes.map(note =>
      Object.assign(
        {
          _active: note._id === noteId,
          _href: _href(
            'notes',
            note._id !== noteId && note._id,
            filter,
            search,
          ),
        },
        note,
      ),
    );
  },
);

const _user = pure((data: UserType | null, diff: Partial<UserType> | null) => {
  if (!data) {
    return null;
  }
  if (!diff) {
    return { ...data, _changed: false };
  }

  const user = { ...data, ...diff };
  user._changed = JSON.stringify(data) !== JSON.stringify(user);
  return user;
});

// Initial state.
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
  userDiff: null,
});
