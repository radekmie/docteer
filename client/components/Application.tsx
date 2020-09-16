import { Component, h } from 'preact';

import { StateType } from '../../types';
import * as tree from '../state';
import { Account } from './Account';
import { Actions } from './Actions';
import { Filters } from './Filters';
import { Help } from './Help';
import { Landing } from './Landing';
import { Navigation } from './Navigation';
import { Note } from './Note';
import { Resizer } from './Resizer';
import { Settings } from './Settings';
import { Toasts } from './Toasts';

type Application$Props = {
  view: string;
};

type Application$State = {
  state: StateType;
};

export class Application extends Component<
  Application$Props,
  Application$State
> {
  constructor(props: Application$Props) {
    super(props);

    this.state = { state: tree.state() };
    this._sync = () => {
      this.setState({ state: tree.state() });
    };

    tree.on(this._sync);
  }

  componentWillUnmount() {
    tree.off(this._sync);
  }

  _sync: () => void;

  // eslint-disable-next-line complexity
  render(props: Application$Props, { state }: Application$State) {
    const view = props.view || state.view;

    return (
      <main
        className={`app dark-gray flex h-100 lh-copy${
          state.load ? ' hidden' : ''
        } w-100`}
        data-application
      >
        <Navigation pend={state.pend} user={state.user} />

        {view === '' && (
          <div className="flex flex-center w-100">
            <Landing />
          </div>
        )}

        {view === 'notes' && (
          <Filters
            labels={state.labels}
            notes={state.notesVisible}
            search={state.search}
          />
        )}

        {view === 'notes' && <Resizer />}

        {view === 'notes' && state.note && state.user && (
          <Note edit={state.edit} note={state.note} user={state.user} />
        )}

        {(view === 'login' || view === 'signup') && (
          <div className="flex flex-center w-100">
            <Account signup={view === 'signup'} />
          </div>
        )}

        {view === 'settings' && state.user && (
          <div className="h-100 overflow-auto pa3 w-100">
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
