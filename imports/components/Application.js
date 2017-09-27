// @flow
// @jsx h

import {Component} from 'preact';
import {h}         from 'preact';

import {tree} from '/imports/lib/state';

import {Account}      from './Account';
import {Actions}      from './Actions';
import {Labels}       from './Labels';
import {Navigation}   from './Navigation';
import {Notes}        from './Notes';
import {Note}         from './Note';
import {Settings}     from './Settings';
import {Splashscreen} from './Splashscreen';
import {Toasts}       from './Toasts';

import type {TLabel} from '/imports/types.flow';
import type {TNote}  from '/imports/types.flow';
import type {TToast} from '/imports/types.flow';
import type {TUser}  from '/imports/types.flow';

const watcher = tree.watch({
  edit:   ['edit'],
  full:   ['full'],
  labels: ['labels'],
  load:   ['load'],
  note:   ['note'],
  notes:  ['notesVisible'],
  pend:   ['pend'],
  search: ['search'],
  toasts: ['toasts'],
  user:   ['user'],
  view:   ['view']
});

type Application$Props = {};
type Application$State = {
  edit: bool,
  full: bool,
  labels: TLabel[],
  load: bool,
  note: ?TNote,
  notes: TNote[],
  pend: number,
  search: string,
  toasts: TToast[],
  user: TUser,
  view: ?string
};

export class Application extends Component<Application$Props, Application$State> {
  _sync: () => void;

  constructor () {
    super(...arguments);

    this.state = watcher.get();
    this._sync = () => {
      this.setState(watcher.get());
    };

    watcher.on('update', this._sync);
  }

  componentWillUnmount () {
    watcher.off('update', this._sync);
  }

  render () {
    const state = this.state;

    return (
      <main class={`app dark-gray flex lh-copy${state.load ? ' loading' : ''}`}>
        <Navigation full={state.full} pend={state.pend} user={state.user} view={state.view} />

        {state.view === '' && (
          <div class="flex flex-center w-100">
            <Splashscreen />
          </div>
        )}

        {state.view === 'd' && (
          <Labels labels={state.labels} />
        )}

        {state.view === 'd' && (
          <Notes notes={state.notes} search={state.search} />
        )}

        {state.view === 'd' && (
          <Note labels={state.labels} note={state.note} edit={state.edit} user={state.user} />
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

        <Actions note={!!state.note} edit={state.edit} user={state.user} view={state.view} />

        <Toasts toasts={state.toasts} />
      </main>
    );
  }
}
