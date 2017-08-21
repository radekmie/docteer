  /** @jsx h */

import {Component, h} from 'preact';

import {tree} from '/imports/state/instance';

import {Account}      from './Account';
import {Actions}      from './Actions';
import {Docs}         from './Docs';
import {Doc}          from './Doc';
import {Labels}       from './Labels';
import {Logo}         from './Logo';
import {Splashscreen} from './Splashscreen';
import {Toasts}       from './Toasts';

const watcher = tree.watch({
    doc:    ['doc'],
    docId:  ['docId'],
    docs:   ['docsVisible'],
    filter: ['filterString'],
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
            <main class={`app cf dark-gray lh-copy${state.load ? ' loading' : ''}`}>
                <section class="b--dark-gray br bw1 fl flex flex-column h-100 w-20">
                    <header class="b--dark-gray bb bw1 cf pt1">
                        <a class="dark-gray hover-black link" href="/">
                            <Logo class={`fl${state.pend ? '' : ' freeze'} w3`} />

                            <h1 class="fl f4">
                                DocTear
                            </h1>
                        </a>
                    </header>

                    {state.user ? (
                        <Labels labels={state.labels} />
                    ) : (
                        <div class="filler flex-auto near-white" />
                    )}

                    <Account user={state.user} />
                </section>

                {!!state.user && (
                    <Docs docId={state.docId} filter={state.filter} docs={state.docs} search={state.search} />
                )}

                {!!state.user && state.doc ? (
                    <Doc labels={state.labels} doc={state.doc} view={state.view} />
                ) : (
                    <Splashscreen class={state.user ? 'w-50' : 'w-75'} />
                )}

                <Toasts toasts={state.toasts} />

                {!!state.user && (
                    <Actions doc={!!state.doc} view={state.view} />
                )}
            </main>
        );
    }
}
