/** @jsx h */

import {h} from 'preact';

import {onSearch} from '/imports/lib/stateActions';

function Note (props) {
  const note = props.note;
  const color = note._created
    ? note._removed
      ? 'gray hover-light-gray'
      : 'green hover-light-green'
    : note._removed
      ? 'hover-light-red red'
      : note._updated
        ? 'blue hover-light-blue'
        : 'dark-gray'
    ;

  return (
    <a
      class={`${note._active ? 'bg-near-white bl bw2 b--dark-gray ' : ''}db ${color} hover-bg-near-white link ph2${note._active ? ' pl1' : ''} truncate`}
      dangerouslySetInnerHTML={{__html: note.name || '(untitled)'}}
      href={note._href}
    />
  );
}

export function Notes (props) {
  return (
    <div class="b--dark-gray br bw1 column flex flex-1 flex-column h-100">
      <div class="b--dark-gray bb bw1">
        <label class="flex" for="search" title="Search">
          <input class="bg-near-white bw0 flex-1 pa2" id="search" name="search" placeholder="Search..." onInput={onSearch} type="search" value={props.search} />
        </label>
      </div>

      {props.notes.length ? (
        <div class="flex-1 ma0 overflow-auto">
          {props.notes.map(note =>
            <Note note={note} key={note._id} />
          )}
        </div>
      ) : (
        <div class="pa3 tc">
          {`(no test cases${props.search ? ' found' : ''})`}
        </div>
      )}
    </div>
  );
}
