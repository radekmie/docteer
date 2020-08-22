import { h } from 'preact';

import { LabelType, NoteType } from '../../types';
import { onSearch } from '../actions';
import { iconSearch } from './Icon';
import { Labels } from './Labels';
import { Notes } from './Notes';

type Filters$Props = {
  labels: LabelType[];
  notes: NoteType[];
  search: string;
  standalone?: boolean;
};

export function Filters(props: Filters$Props) {
  return (
    <div
      className={`${props.standalone ? 'ba bw1 ' : ''}column flex flex-column${
        props.standalone ? ' w-100' : ''
      }`}
    >
      <div className="b--dark-gray bb bg-near-white bw1">
        <label className="flex flex-center" htmlFor="search" title="Search">
          <span className="flex flex-center input-icon pa2">{iconSearch}</span>
          <input
            className="br-0 bw0 flex-1 pa2 ph1 w-100"
            id="search"
            name="search"
            placeholder="Search..."
            // @ts-expect-error Invalid event type.
            onInput={onSearch}
            type="search"
            value={props.search}
          />
        </label>
      </div>
      <div className="flex h-100">
        <Labels labels={props.labels} />
        <Notes notes={props.notes} search={props.search} />
      </div>
    </div>
  );
}
