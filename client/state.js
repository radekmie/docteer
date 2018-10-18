// @flow

import Baobab from 'baobab';
import fuzzysort from 'fuzzysort';

import {compare} from '@shared';
import {compareDocs} from '@shared';

export const tree = new Baobab(
  {
    // Data
    notesOrigins: [],
    notesCreated: Object.create(null),
    notesRemoved: Object.create(null),
    notesUpdated: Object.create(null),

    notes: Baobab.monkey(
      ['notesOrigins'],
      ['notesCreated'],
      ['notesRemoved'],
      ['notesUpdated'],
      (origins, created, removed, updated) =>
        origins
          .concat(Object.keys(created).map(_id => ({_created: true, _id})))
          .map(note =>
            Object.assign(
              {_removed: !!removed[note._id], _updated: !!updated[note._id]},
              note,
              updated[note._id]
            )
          )
          .sort(compareDocs)
    ),

    notesFiltered: Baobab.monkey(
      ['notes'],
      ['filter'],
      ['search'],
      (notes, filter, search) => {
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
            (a, b) =>
              b.match.score - a.match.score || compareDocs(a.note, b.note)
          )
          .slice(0, 50)
          .map(single =>
            Object.assign({}, single.note, {
              name: fuzzysort.highlight(single.match, '<b>', '</b>')
            })
          );
      }
    ),

    notesVisible: Baobab.monkey(
      ['notesFiltered'],
      ['noteId'],
      ['filter'],
      ['search'],
      (notes, noteId, filter, search) =>
        notes.map(note =>
          Object.assign(
            {
              _active: note._id === noteId,
              _href: stateToHref(
                'notes',
                note._id !== noteId && note._id,
                filter,
                search
              )
            },
            note
          )
        )
    ),

    noteId: undefined,
    note: Baobab.monkey(['notes'], ['noteId'], (notes, noteId) =>
      notes.find(note => note._id === noteId)
    ),

    labels: Baobab.monkey(
      ['notes'],
      ['notesFiltered'],
      ['filter'],
      ['search'],
      (notes, notesFiltered, filter, search) => {
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
                href: stateToHrefQuery(toggle.sort(compare), search),
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
      }
    ),

    // History
    href: Baobab.monkey(
      ['view'],
      ['noteId'],
      ['filter'],
      ['search'],
      stateToHref
    ),

    // UI
    load: 1,
    pend: 1,

    filter: [],
    search: '',
    toasts: [],

    edit: false,
    help: false,
    last: new Date(0),
    view: '',

    userLoggedIn: Baobab.monkey(['userToken', data => !!data]),
    userToken: Baobab.monkey(['userData'], data => (data ? data.token : null)),
    user: Baobab.monkey(['userData'], ['userDiff'], (data, diff) => {
      if (!data) return null;

      const user = Object.assign({}, data, diff);
      user._changed = JSON.stringify(data) !== JSON.stringify(user);
      return user;
    }),

    userData: null,
    userDiff: null
  },
  {immutable: process.env.NODE_ENV === 'development'}
);

function stateToHref(view, noteId, filter, search) {
  let path = '/';
  if (view) {
    path += view;
    if (noteId) path += `/${noteId}`;
  }

  return path + stateToHrefQuery(filter, search);
}

function stateToHrefQuery(filter, search) {
  let query = '?';
  if (filter.length) query += `filter=${filter}`;
  if (search) {
    if (filter.length) query += '&';
    query += `search=${search}`;
  }

  return query;
}
