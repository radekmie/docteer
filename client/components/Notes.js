// @flow
// @jsx h

import {Component} from 'preact';
import {h} from 'preact';

import {shallowEqual} from '@shared';

import type {NoteType} from '@types';

type NotesItem$Props = {|
  note: NoteType<{|name?: string|}>
|};

class NotesItem extends Component<NotesItem$Props> {
  shouldComponentUpdate(props) {
    return !shallowEqual(this.props.note, props.note);
  }

  // $FlowFixMe
  render({note}: NotesItem$Props) {
    const color = note._created
      ? note._removed
        ? 'gray hover-light-gray'
        : 'green hover-light-green'
      : note._removed
        ? 'hover-light-red red'
        : note._updated
          ? 'blue hover-light-blue'
          : 'dark-gray';

    return (
      <a
        class={`${
          note._active ? 'bg-near-white bl bw2 b--dark-gray ' : ''
        }db ${color} hover-bg-near-white link ph2${
          note._active ? ' pl1' : ''
        } truncate`}
        data-item
        data-test-note={note.name || '(untitled)'}
        dangerouslySetInnerHTML={{__html: note.name || '(untitled)'}}
        href={note._href}
      />
    );
  }
}

type Notes$Props = {|
  notes: NoteType<>[],
  search: string
|};

export function Notes(props: Notes$Props) {
  return (
    <div class="b--dark-gray bl bw1 flex-1 overflow-auto strict">
      {props.notes.length === 0 && (
        <div class="pa3 tc">{`(no notes${props.search ? ' found' : ''})`}</div>
      )}

      {props.notes.map(note => (
        <NotesItem key={note._id} note={note} />
      ))}
    </div>
  );
}
