// @flow
// @jsx h

import {Component} from 'preact';
import {h}         from 'preact';

import {tree} from '/imports/lib/state';

import {Account}      from './Account';
import {Actions}      from './Actions';
import {Header}       from './Header';
import {Labels}       from './Labels';
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
        <div class="b--dark-gray br bw1 column flex flex-1 flex-column h-100">
          <Header pend={state.pend} user={state.user} />

          {!!(state.user && state.view === 'd') && (
            <Labels labels={state.labels} />
          )}

          {!(state.user && state.view === 'd') && (
            <div class="filler flex-1 near-white" />
          )}

          <Account user={state.user} view={state.view} />
        </div>

        {!!state.user && state.view === 'd' && (
          <Notes notes={state.notes} search={state.search} />
        )}

        {!!state.user && !!state.note && state.view === 'd' && (
          <Note labels={state.labels} note={state.note} edit={state.edit} user={state.user} />
        )}

        {!!state.user && !state.note && state.view === 's' && (
          <Settings user={state.user} />
        )}

        {!state.note && state.view !== 's' && (
          <Splashscreen />
        )}

        <Actions note={!!state.note} edit={state.edit} user={state.user} view={state.view} />

        <Toasts toasts={state.toasts} />
      </main>
    );
  }
}
