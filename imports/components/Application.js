/** @jsx h */

import {Component, h} from 'preact';

import {tree} from '/imports/state/instance';

import {Account}      from './Account';
import {Actions}      from './Actions';
import {Labels}       from './Labels';
import {Logo}         from './Logo';
import {Proofs}       from './Proofs';
import {Proof}        from './Proof';
import {Splashscreen} from './Splashscreen';
import {Toasts}       from './Toasts';

const watcher = tree.watch({
    filter: ['filterString'],
    labels: ['labels'],
    load:   ['load'],
    pend:   ['pend'],
    proof:  ['proof'],
    proofs: ['proofsVisible'],
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
            <main class={`app cf dark-gray lh-copy${state.load ? ' loading' : ''} sans-serif`}>
                <section class="b--dark-gray br bw1 fl flex flex-column h-100 w-20">
                    <header class="b--dark-gray bb bw1 cf pt1">
                        <a class="dark-gray hover-gray link" href="/">
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
                    <Proofs filter={state.filter} proofs={state.proofs} search={state.search} />
                )}

                {!!state.user && state.proof ? (
                    <Proof labels={state.labels} proof={state.proof} view={state.view} />
                ) : (
                    <Splashscreen class={state.user ? 'w-50' : 'w-75'} />
                )}

                <Toasts toasts={state.toasts} />

                {!!state.user && (
                    <Actions proof={!!state.proof} view={state.view} />
                )}
            </main>
        );
    }
}
