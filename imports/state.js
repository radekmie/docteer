// @flow

import Baobab from 'baobab';
import fuzzysort from 'fuzzysort';

import {Minimongo} from 'meteor/minimongo';

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
          .map(x =>
            Object.assign(
              {_removed: !!removed[x._id], _updated: !!updated[x._id]},
              x,
              updated[x._id]
            )
          )
          .sort(
            (a, b) => a.name.localeCompare(b.name) || a._id.localeCompare(b._id)
          )
    ),

    notesVisible: Baobab.monkey(
      ['notes'],
      ['noteId'],
      ['filter'],
      ['search'],
      (notes, noteId, filter, search) => {
        if (filter.length)
          notes = notes.filter(note =>
            filter.every(filter => note.labels.some(label => label === filter))
          );

        const term = search.trim();

        if (term) {
          try {
            const selector = JSON.parse(term);

            if (typeof selector !== 'object') throw new Error();

            const matcher = new Minimongo.Matcher(selector, false);

            notes = notes.filter(note => matcher.documentMatches(note).result);
          } catch (error) {
            notes = notes
              .reduce((notes, note) => {
                const match = fuzzysort.single(term, note.name);

                if (match) notes.push({note, match});

                return notes;
              }, [])
              .sort(
                (a, b) =>
                  b.match.score - a.match.score ||
                  a.note.name.localeCompare(b.note.name)
              )
              .slice(0, 50)
              .map(single =>
                Object.assign({}, single.note, {
                  name: fuzzysort.highlight(single.match, '<b>', '</b>')
                })
              );
          }
        }

        return notes.map(note =>
          Object.assign(
            {
              _active: note._id === noteId,
              _href: stateToHref(
                'd',
                note._id !== noteId && note._id,
                filter,
                search
              )
            },
            note
          )
        );
      }
    ),

    noteId: undefined,
    note: Baobab.monkey(['notes'], ['noteId'], (notes, noteId) =>
      notes.find(note => note._id === noteId)
    ),

    labels: Baobab.monkey(
      ['notes'],
      ['notesVisible'],
      ['noteId'],
      ['filter'],
      ['search'],
      (notes, notesVisible, noteId, filter, search) =>
        notes
          .reduce((labels, note) => {
            note.labels.forEach(label => {
              if (label && !labels.includes(label)) labels.push(label);
            });

            return labels;
          }, [])
          .sort()
          .map(name => {
            const active = filter.includes(name);
            const toggle = active
              ? filter.filter(filter => filter !== name)
              : filter.concat(name);

            return {
              active,
              name,
              href: stateToHref('d', noteId, toggle, search),
              count: notesVisible.reduce(
                (count, note) => count + note.labels.includes(name),
                0
              ),
              total: notes.reduce(
                (count, note) => count + note.labels.includes(name),
                0
              )
            };
          })
    ),

    labelsNames: Baobab.monkey(['labels'], labels =>
      labels.map(label => label.name)
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
    view: undefined,

    user: Baobab.monkey(['userData'], ['userDiff'], (data, diff) => {
      if (data === undefined) return undefined;

      const user = Object.assign({}, data, diff);
      user._changed = JSON.stringify(data) !== JSON.stringify(user);
      return user;
    }),

    userData: undefined,
    userDiff: undefined
  },
  {immutable: process.env.NODE_ENV === 'development'}
);

function stateToHref(view, noteId, filter, search) {
  return [
    `/${[view, view && noteId].filter(Boolean).join('/')}`,
    [
      filter.length &&
        `filter=${filter
          .slice()
          .sort()
          .join(',')}`,
      search && `search=${search}`
    ]
      .filter(Boolean)
      .join('&')
  ]
    .filter(Boolean)
    .join('?');
}
