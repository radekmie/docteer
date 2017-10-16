// @flow
// @jsx h

import {Component} from 'preact';
import {h} from 'preact';

import {Account} from './Account';
import {Actions} from './Actions';
import {Help} from './Help';
import {Navigation} from './Navigation';
import {Notes} from './Notes';
import {Note} from './Note';
import {Settings} from './Settings';
import {Splashscreen} from './Splashscreen';
import {Toasts} from './Toasts';
import {tree} from '../state';

const watcher = tree.watch({
  edit: ['edit'],
  full: ['full'],
  help: ['help'],
  labels: ['labels'],
  load: ['load'],
  note: ['note'],
  notes: ['notesVisible'],
  pend: ['pend'],
  search: ['search'],
  toasts: ['toasts'],
  user: ['user'],
  view: ['view']
});

class TLabel {
  count: number;
  href: string;
  name: string;
  total: number;
}

class TNote {
  _id: string;
  _href: string;
}

class TToast {
  _id: number;
  type: 'info' | 'error' | 'success';
  text: string;
}

class TUser {
  _changed: boolean;
  emails: {address: string, verified: boolean}[];
  schemas: {name: string, fields: {[string]: 'div' | 'ol' | 'ul'}}[];
}

type Application$Props = {};
type Application$State = {
  edit: boolean,
  full: boolean,
  help: boolean,
  labels: TLabel[],
  load: boolean,
  note: ?TNote,
  notes: TNote[],
  pend: number,
  search: string,
  toasts: TToast[],
  user: TUser,
  view: ?string
};

export class Application extends Component<
  Application$Props,
  Application$State
> {
  _sync: () => void;

  constructor() {
    super(...arguments);

    this.state = watcher.get();
    this._sync = () => {
      this.setState(watcher.get());
    };

    watcher.on('update', this._sync);
  }

  componentWillUnmount() {
    watcher.off('update', this._sync);
  }

  render() {
    const state = this.state;

    return (
      <main class={`app dark-gray flex lh-copy${state.load ? ' hidden' : ''}`}>
        <Navigation
          full={state.full}
          pend={state.pend}
          user={state.user}
          view={state.view}
        />

        {state.view === '' && (
          <div class="flex flex-center w-100">
            <Splashscreen />
          </div>
        )}

        {state.view === 'd' && (
          <Notes
            labels={state.labels}
            notes={state.notes}
            search={state.search}
          />
        )}

        {state.view === 'd' && (
          <Note
            labels={state.labels}
            note={state.note}
            edit={state.edit}
            user={state.user}
          />
        )}

        {state.view === 'l' && (
          <div class="flex flex-center w-100">
            <Account />
          </div>
        )}

        {state.view === 's' && (
          <div class="h-100 overflow-auto pa3 w-100">
            <Settings user={state.user} />
          </div>
        )}

        <Actions
          note={!!state.note}
          edit={state.edit}
          user={state.user}
          view={state.view}
        />

        <Help active={state.help} />

        <Toasts toasts={state.toasts} />
      </main>
    );
  }
}
