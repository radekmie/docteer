// @flow
// @jsx h

import {Component} from 'preact';
import {h} from 'preact';

import {Account} from './Account';
import {Actions} from './Actions';
import {Help} from './Help';
import {Landing} from './Landing';
import {Navigation} from './Navigation';
import {Notes} from './Notes';
import {Note} from './Note';
import {Resizer} from './Resizer';
import {Settings} from './Settings';
import {Toasts} from './Toasts';
import {tree} from '../state';

import type {LabelType} from '../types.flow';
import type {NoteType} from '../types.flow';
import type {ToastType} from '../types.flow';
import type {UserType} from '../types.flow';

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

type Application$Props = {|
  view?: string
|};

type Application$State = {|
  edit: boolean,
  full: boolean,
  help: boolean,
  labels: LabelType[],
  load: boolean,
  note: ?NoteType<*>,
  notes: NoteType<*>[],
  pend: number,
  search: string,
  toasts: ToastType[],
  user: UserType,
  view: ?string
|};

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
    watcher.release();
  }

  // $FlowFixMe
  render(props: Application$Props, state: Application$State) {
    const view = props.view || state.view;

    return (
      <main class={`app dark-gray flex lh-copy${state.load ? ' hidden' : ''}`}>
        <Navigation
          full={state.full}
          pend={state.pend}
          user={state.user}
          view={view}
        />

        {view === '' && (
          <div class="flex flex-center w-100">
            <Landing />
          </div>
        )}

        {view === 'notes' && (
          <Notes
            labels={state.labels}
            notes={state.notes}
            search={state.search}
          />
        )}

        {view === 'notes' && <Resizer />}

        {view === 'notes' && (
          <Note
            labels={state.labels}
            note={state.note}
            edit={state.edit}
            user={state.user}
          />
        )}

        {(view === 'login' || view === 'signup') && (
          <div class="flex flex-center w-100">
            <Account signup={view === 'signup'} />
          </div>
        )}

        {view === 'settings' && (
          <div class="h-100 overflow-auto pa3 w-100">
            <Settings user={state.user} />
          </div>
        )}

        <Actions
          note={!!state.note}
          edit={state.edit}
          user={state.user}
          view={view}
        />

        <Help active={state.help} />

        <Toasts toasts={state.toasts} />
      </main>
    );
  }
}
