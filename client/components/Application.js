// @flow
// @jsx h

import {Component, h} from 'preact';

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
import * as tree from '@client/state';

import type {StateType} from '@types';

type Application$Props = {|
  view?: string
|};

type Application$State = {|
  state: StateType
|};

export class Application extends Component<
  Application$Props,
  Application$State
> {
  constructor() {
    super(...arguments);

    this.state = {state: tree.state()};
    this._sync = () => {
      this.setState({state: tree.state()});
    };

    tree.on(this._sync);
  }

  componentWillUnmount() {
    tree.off(this._sync);
  }

  _sync: () => void;

  render(props: Application$Props, {state}: Application$State) {
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
            notes={state.notesVisible}
            search={state.search}
          />
        )}

        {view === 'notes' && <Resizer />}

        {view === 'notes' && state.user && (
          <Note edit={state.edit} note={state.note} user={state.user} />
        )}

        {(view === 'login' || view === 'signup') && (
          <div class="flex flex-center w-100">
            <Account signup={view === 'signup'} />
          </div>
        )}

        {view === 'settings' && state.user && (
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
