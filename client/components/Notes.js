// @flow
// @jsx h

import {h} from 'preact';

import {Labels} from './Labels';
import {iconSearch} from './Icon';
import {onSearch} from '@client/actions';

import type {LabelType} from '@types';
import type {NoteType} from '@types';

type Note$Props = {|
  note: NoteType<*>
|};

function Note({note}: Note$Props) {
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

type Notes$Props = {|
  labels: LabelType[],
  notes: NoteType<*>[],
  search: string,
  standalone?: boolean
|};

export function Notes(props: Notes$Props) {
  return (
    <div
      class={`${props.standalone ? 'ba bw1 ' : ''}column flex flex-column${
        props.standalone ? ' w-100' : ''
      }`}
    >
      <div class="b--dark-gray bb bg-near-white bw1">
        <label class="flex flex-center" for="search" title="Search">
          <span class="flex flex-center input-icon pa2">{iconSearch}</span>

          <input
            class="br-0 bw0 flex-1 pa2 ph1"
            id="search"
            name="search"
            placeholder="Search..."
            onInput={onSearch}
            type="search"
            value={props.search}
          />
        </label>
      </div>

      <div class="flex h-100">
        <Labels labels={props.labels} />

        <div class="b--dark-gray bl bw1 flex-1 overflow-auto">
          {props.notes.length === 0 && (
            <div class="pa3 tc">
              {`(no notes${props.search ? ' found' : ''})`}
            </div>
          )}

          {props.notes.map(note => (
            <Note key={note._id} note={note} />
          ))}
        </div>
      </div>
    </div>
  );
}