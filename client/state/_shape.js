// @flow

import fuzzysort from 'fuzzysort';

import {compare} from '@shared';
import {compareDocs} from '@shared';
import {pure} from '@shared';

import type {ShapeType} from '@types';
import type {StoreType} from '@types';

export function storeToShape({
  filter,
  noteId,
  notesCreated,
  notesOrigins,
  notesRemoved,
  notesUpdated,
  search,
  userData,
  userDiff,
  view
}: $ReadOnly<StoreType>): ShapeType {
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
    userToken: _userToken(userData)
  };
}

function _href(view, noteId, filter, search) {
  let path = '/';
  if (view) {
    path += view;
    if (noteId) path += `/${noteId}`;
  }

  return path + _query(filter, search);
}

function _query(filter, search) {
  let query = '?';
  if (filter.length) query += `filter=${filter.join()}`;
  if (search) {
    if (filter.length) query += '&';
    query += `search=${search}`;
  }

  return query;
}

const _labels = pure((notes, notesFiltered, filter, search) => {
  const labels = Object.create(null);
  const labelsList = [];

  notes.forEach(note => {
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
          total: 1
        };

        labelsList.push(labels[name]);
      }
    });
  });

  notesFiltered.forEach(note => {
    note.labels.forEach(name => {
      if (name in labels) labels[name].count++;
    });
  });

  return labelsList.sort(compareDocs);
});

const _note = pure((notes, noteId) => {
  return notes.find(note => note._id === noteId);
});

const _notes = pure((origins, created, removed, updated) => {
  return origins
    .concat(Object.keys(created).map(_id => ({_created: true, _id})))
    .map(note => ({
      _removed: !!removed[note._id],
      _updated: !!updated[note._id],
      ...note,
      ...updated[note._id]
    }))
    .sort(compareDocs);
});

const _notesFiltered = pure((notes, filter, search) => {
  if (filter.length)
    notes = notes.filter(note =>
      filter.every(filter => note.labels.some(label => label === filter))
    );

  const term = search.trim();
  if (term === '') return notes;

  return notes
    .reduce((notes, note) => {
      const match = fuzzysort.single(term, note.name);

      if (match) notes.push({note, match});

      return notes;
    }, [])
    .sort(
      (a, b) => b.match.score - a.match.score || compareDocs(a.note, b.note)
    )
    .slice(0, 50)
    .map(single =>
      Object.assign({}, single.note, {
        name: fuzzysort.highlight(single.match, '<b>', '</b>')
      })
    );
});

const _notesVisible = pure((notes, noteId, filter, search) => {
  return notes.map(note =>
    Object.assign(
      {
        _active: note._id === noteId,
        _href: _href('notes', note._id !== noteId && note._id, filter, search)
      },
      note
    )
  );
});

const _user = pure((data, diff) => {
  if (!data) return null;
  if (!diff) return {...data, _changed: false};
  const user = {...data, ...diff};
  user._changed = JSON.stringify(data) !== JSON.stringify(user);
  return user;
});

const _userLoggedIn = pure(data => {
  return !!data;
});

const _userToken = pure(data => {
  return data && data.token;
});
