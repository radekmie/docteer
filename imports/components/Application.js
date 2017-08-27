/** @jsx h */

import {Component, h} from 'preact';

import {tree} from '/imports/state/instance';

import {Account}      from './Account';
import {Actions}      from './Actions';
import {Docs}         from './Docs';
import {Doc}          from './Doc';
import {Header}       from './Header';
import {Labels}       from './Labels';
import {Settings}     from './Settings';
import {Splashscreen} from './Splashscreen';
import {Toasts}       from './Toasts';

const watcher = tree.watch({
    doc:    ['doc'],
    docs:   ['docsVisible'],
    edit:   ['edit'],
    labels: ['labels'],
    load:   ['load'],
    pend:   ['pend'],
    search: ['search'],
    toasts: ['toasts'],
    user:   ['user'],
    view:   ['view']
});

export class Application extends Component {
    constructor () {
        super(...arguments);

        this.state = watcher.get();
        this._sync = () => this.setState(watcher.get());

        watcher.on('update', this._sync);
    }

    componentWillUnmount () {
        watcher.off('update', this._sync);
    }

    render (props, state) {
        return (
            <main class={`app dark-gray flex lh-copy${state.load ? ' loading' : ''}`}>
                <div class="b--dark-gray br bw1 column flex flex-auto flex-column h-100">
                    <Header pend={state.pend} user={state.user} />

                    {!!(state.user && state.view === 'd') && (
                        <Labels labels={state.labels} />
                    )}

                    {!!(state.user && state.view === 'd') || (
                        <div class="filler flex-auto near-white" />
                    )}

                    <Account user={state.user} />
                </div>

                {!!state.user && state.view === 'd' && (
                    <Docs docs={state.docs} search={state.search} />
                )}

                {!!state.user && !!state.doc && state.view === 'd' && (
                    <Doc labels={state.labels} doc={state.doc} edit={state.edit} />
                )}

                {!!state.user && !!state.doc || state.view === 's' && (
                    <Settings user={state.user} />
                )}

                {!!state.doc || state.view !== 's' && (
                    <Splashscreen />
                )}

                <Actions doc={!!state.doc} edit={state.edit} user={state.user} view={state.view} />

                <Toasts toasts={state.toasts} />
            </main>
        );
    }
}
