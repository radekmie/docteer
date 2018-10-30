// @flow
// @jsx h

import {Component} from 'preact';
import {h} from 'preact';

import {Account} from '@client/components/Account';
import {Actions} from '@client/components/Actions';
import {Filters} from '@client/components/Filters';
import {Help} from '@client/components/Help';
import {Landing} from '@client/components/Landing';
import {Navigation} from '@client/components/Navigation';
import {Note} from '@client/components/Note';
import {Resizer} from '@client/components/Resizer';
import {Settings} from '@client/components/Settings';
import {Toasts} from '@client/components/Toasts';
import {tree} from '@client/state';

import type {LabelType} from '@types';
import type {NoteType} from '@types';
import type {ToastType} from '@types';
import type {UserType} from '@types';

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
  help: boolean,
  labels: LabelType[],
  load: boolean,
  note: ?NoteType<>,
  notes: NoteType<>[],
  pend: number,
  search: string,
  toasts: ToastType[],
  user: UserType,
  view: string
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
      <main
        class={`app dark-gray flex lh-copy${state.load ? ' hidden' : ''}`}
        data-application
      >
        <Navigation pend={state.pend} user={state.user} />

        {view === '' && (
          <div class="flex flex-center w-100">
            <Landing />
          </div>
        )}

        {view === 'notes' && (
          <Filters
            labels={state.labels}
            notes={state.notes}
            search={state.search}
          />
        )}

        {view === 'notes' && <Resizer />}

        {view === 'notes' && (
          <Note edit={state.edit} note={state.note} user={state.user} />
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
