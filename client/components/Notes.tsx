import { Component, h } from 'preact';

import { shallowEqual } from '../../shared';
import { NoteType } from '../../types';

type NotesItem$Props = {
  note: NoteType;
};

class NotesItem extends Component<NotesItem$Props> {
  shouldComponentUpdate(props: NotesItem$Props) {
    return !shallowEqual(this.props.note, props.note);
  }

  render({ note }: NotesItem$Props) {
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
        className={`${
          note._active ? 'bg-near-white bl bw2 b--dark-gray ' : ''
        }db ${color} hover-bg-near-white link ph2${
          note._active ? ' pl1' : ''
        } truncate`}
        data-item
        data-test-note={note.name || '(untitled)'}
        // @ts-expect-error Unknown field.
        dangerouslySetInnerHTML={{ __html: note.name || '(untitled)' }}
        href={note._href}
      />
    );
  }
}

type Notes$Props = {
  notes: NoteType[];
  search: string;
};

export class Notes extends Component<Notes$Props> {
  shouldComponentUpdate(props: Notes$Props) {
    return !shallowEqual(this.props, props);
  }

  render({ notes, search }: Notes$Props) {
    return (
      <div className="b--dark-gray bl bw1 flex-1 overflow-auto strict">
        {notes.length === 0 && (
          <div className="pa3 tc">{`(no notes${search ? ' found' : ''})`}</div>
        )}

        {notes.map(note => (
          <NotesItem key={note._id} note={note} />
        ))}
      </div>
    );
  }
}
