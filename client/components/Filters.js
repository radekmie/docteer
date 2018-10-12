// @flow
// @jsx h

import {h} from 'preact';

import {Labels} from '@client/components/Labels';
import {Notes} from '@client/components/Notes';
import {iconSearch} from '@client/components/Icon';
import {onSearch} from '@client/actions';

import type {LabelType} from '@types';
import type {NoteType} from '@types';

type Filters$Props = {|
  labels: LabelType[],
  notes: NoteType<>[],
  search: string,
  standalone?: boolean
|};

export function Filters(props: Filters$Props) {
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
        <Notes notes={props.notes} search={props.search} />
      </div>
    </div>
  );
}
