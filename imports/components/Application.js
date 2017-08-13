/** @jsx h */

import {Component, h} from 'preact';

import {
    onAdd,
    onChange,
    onFilter,
    onLogin,
    onLogout,
    onRemove,
    onSave,
    onView
} from '/imports/state/actions';

/* eslint-disable max-len */
const iconAdd = icon('M417.4 224H288V94.6c0-16.9-14.3-30.6-32-30.6s-32 13.7-32 30.6V224H94.6C77.7 224 64 238.3 64 256s13.7 32 30.6 32H224v129.4c0 16.9 14.3 30.6 32 30.6s32-13.7 32-30.6V288h129.4c16.9 0 30.6-14.3 30.6-32s-13.7-32-30.6-32z');
const iconDo = icon('M448 294.4v-76.8h-42.8c-3.4-14.4-8.9-28-16.1-40.5l29.8-29.7-54.3-54.3-29.1 29.1c-12.6-7.7-26.4-13.5-41.1-17.3V64h-76.8v40.9c-14.7 3.8-28.5 9.7-41.1 17.3l-29.1-29.1-54.3 54.3 29.8 29.7c-7.2 12.5-12.6 26.1-16.1 40.5H64v76.8h44.1c3.8 13.7 9.5 26.6 16.7 38.6l-31.7 31.7 54.3 54.3 32.3-32.3c11.7 6.8 24.5 11.9 37.9 15.4v46h76.8v-46c13.5-3.5 26.2-8.6 37.9-15.4l32.3 32.3 54.3-54.3-31.6-31.7c7.2-11.9 12.9-24.8 16.7-38.6h44zm-192 15.4c-29.7 0-53.7-24.1-53.7-53.8s24-53.8 53.7-53.8 53.8 24.1 53.8 53.8-24.1 53.8-53.8 53.8z');
const iconNo = icon('M443.6 387.1L312.4 255.4l131.5-130c5.4-5.4 5.4-14.2 0-19.6l-37.4-37.6c-2.6-2.6-6.1-4-9.8-4-3.7 0-7.2 1.5-9.8 4L256 197.8 124.9 68.3c-2.6-2.6-6.1-4-9.8-4-3.7 0-7.2 1.5-9.8 4L68 105.9c-5.4 5.4-5.4 14.2 0 19.6l131.5 130L68.4 387.1c-2.6 2.6-4.1 6.1-4.1 9.8 0 3.7 1.4 7.2 4.1 9.8l37.4 37.6c2.7 2.7 6.2 4.1 9.8 4.1 3.5 0 7.1-1.3 9.8-4.1L256 313.1l130.7 131.1c2.7 2.7 6.2 4.1 9.8 4.1 3.5 0 7.1-1.3 9.8-4.1l37.4-37.6c2.6-2.6 4.1-6.1 4.1-9.8-.1-3.6-1.6-7.1-4.2-9.7z');
const iconOk = icon('M448 71.9c-17.3-13.4-41.5-9.3-54.1 9.1L214 344.2l-99.1-107.3c-14.6-16.6-39.1-17.4-54.7-1.8-15.6 15.5-16.4 41.6-1.7 58.1 0 0 120.4 133.6 137.7 147 17.3 13.4 41.5 9.3 54.1-9.1l206.3-301.7c12.6-18.5 8.7-44.2-8.6-57.5z');
const iconRemove = icon('M417.4 224H94.6C77.7 224 64 238.3 64 256s13.7 32 30.6 32h322.8c16.9 0 30.6-14.3 30.6-32s-13.7-32-30.6-32z');
/* eslint-enable max-len */

class PureComponent extends Component {
    shouldComponentUpdate (props) {
        for (const key in props)
            if (this.props[key] !== props[key])
                return true;

        for (const key in props)
            if (!(key in props))
                return true;

        return false;
    }
}

class Account extends PureComponent {
    onRefEmail = ref => {
        this.email = ref;
    };

    onRefPassword = ref => {
        this.password = ref;
    };

    onSubmit = event => {
        event.preventDefault();

        if (!this.email || !this.password)
            return;

        onLogin(this.email.value, this.password.value);
    };

    render (props) {
        return (
            <form className="b--dark-gray bt bw1 pa1" onSubmit={this.onSubmit}>
                {!!props.user && (
                    <div className="mb1 tc w-100">
                        <b>{props.user.emails[0].address}</b>
                    </div>
                )}

                {!!props.user && (
                    <button className="w-100" onClick={onLogout}>Log Out</button>
                )}

                {!!props.user || (
                    <label className="flex mb1" htmlFor="email">
                        <code><b>L</b></code>
                        <input className={`bg-${props.error ? 'washed-red' : 'near-white'} bw0 flex-auto ml1 ph1`} defaultValue="admin@doctear.com" id="email" name="email" ref={this.onRefEmail} type="email" />
                    </label>
                )}

                {!!props.user || (
                    <label className="flex mb1" htmlFor="password">
                        <code><b>P</b></code>
                        <input className={`bg-${props.error ? 'washed-red' : 'near-white'} bw0 flex-auto ml1 ph1`} defaultValue="doctear" id="password" name="password" ref={this.onRefPassword} type="password" />
                    </label>
                )}

                {!!props.user || (
                    <button className="w-100">Log In</button>
                )}
            </form>
        );
    }
}

class Editable extends Component {
    onRef = element => this.element = element;
    onChange = () => {
        if (!this.props.onChange)
            return;

        if (!this.element)
            return;

        if (this.element.innerHTML === this.props.html)
            return;

        this.props.onChange(this.element.innerHTML);
    };

    shouldComponentUpdate (props) {
        if (!this.element)
            return true;

        if (this.props.disabled !== props.disabled)
            return true;

        if (this.props.html !== props.html && this.element.innerHTML !== props.html)
            return true;

        if ((props.tag === 'ol' || props.tag === 'ul') && !this.element.innerHTML.startsWith('<li>'))
            return true;

        return false;
    }

    componentDidUpdate () {
        if (this.element && this.element.innerHTML !== this.props.html)
            this.element.innerHTML = getContent(this.props.disabled, this.props.html, this.props.placeholder);
    }

    render ({disabled, html, placeholder, tag, ...props}) {
        return h(tag || 'div', Object.assign(props, {
            className: ['ph1', props.className, disabled ? '' : 'bg-near-white'].filter(Boolean).join(' '),
            contentEditable: !disabled,
            dangerouslySetInnerHTML: {__html: getContent(disabled, html, placeholder)},

            onBlur:  this.onChange,
            onInput: this.onChange,
            ref:     this.onRef
        }));
    }
}

class Description extends PureComponent {
    render (props) {
        return (
            <div className={`fl pv3 tc ${props.className}`}>
                Some description should be placed here!
            </div>
        );
    }
}

class LabelsLabel extends PureComponent {
    onFilter = () => onFilter(this.props.label.name);

    render (props) {
        return (
            <li>
                <label className="cf db pointer" htmlFor={props.label.name}>
                    <input checked={props.label.active} className="mr2 v-mid" id={props.label.name} onChange={this.onFilter} type="checkbox" />
                    {props.label.name}

                    <span className="fr">
                        {`${props.label.count}/${props.label.total}`}
                    </span>
                </label>
            </li>
        );
    }
}

class Filler extends PureComponent {
    render () {
        return (
            <div className="filler flex-auto near-white" />
        );
    }
}

class Labels extends PureComponent {
    render (props) {
        if (props.labels.length === 0) {
            return (
                <div className="flex-auto pa3 tc">
                    (no labels)
                </div>
            );
        }

        return (
            <div className="flex-auto list overflow-auto ph3">
                {props.labels.map(label =>
                    <LabelsLabel key={label.name} label={label} />
                )}
            </div>
        );
    }
}

class Header extends PureComponent {
    render () {
        return (
            <header className="b--dark-gray bb bw1 cf pt1">
                <a href="/">
                    <svg className="fl w3" viewBox="0 0 32 32">
                        <path d="M7 21v4h1v-4zm10 0v4h1v-4" />
                        <path d="M9 21v3h1v-3zm16 0v3h1v-3" />
                        <path d="M11 21v6h1v-6zm10 0v6h1v-6" />
                        <path d="M13 21v2h1v-2zm6 0v2h1v-2" />
                        <path d="M15 21v5h1v-5zm8 0v5h1v-5" />
                        <path d="M27 20H6v2H5v-5h1v2h21v-2h1v5h-1v-2zm-1-2v-8l-6-7H9C7 3 7 4 7 5v13h1V5c0-1 0-1 1-1h10v5c0 1 1 2 2 2h4v7z" />
                    </svg>

                    <h1 className="dark-gray fl f4 hover-gray link">
                        DocTear
                    </h1>
                </a>
            </header>
        );
    }
}

class Proof extends PureComponent {
    onChange = (key, map) => html => {
        onChange(this.props.proof._id, key, map ? map(html) : html);
    };

    onEnsure = key => () => {
        if (!this.props.proof[key].length)
            onChange(this.props.proof._id, key, ['']);
    };

    onExpect = this.onChange('expect');
    onLabels = this.onChange('labels', listToSteps);
    onName   = this.onChange('name');
    onSteps  = this.onChange('steps', listToSteps);
    onTarget = this.onChange('target');

    onLabelsFocus = this.onEnsure('labels');
    onStepsFocus = this.onEnsure('steps');

    render (props) {
        return (
            <dl className="fl h-100 ma0 overflow-auto pa4 w-50">
                <dt><b>Name:</b></dt>
                <dd><Editable disabled={props.view} html={props.proof.name} onChange={this.onName} placeholder="(untitled)" /></dd>

                <dt className="mt3"><b>Labels:</b></dt>
                <dd><Editable className="mv0 pl0" disabled={props.view} html={stepsToList(props.proof.labels)} onChange={this.onLabels} onFocus={this.onLabelsFocus} placeholder="(no labels)" tag="ul" /></dd>

                <dt className="mt3"><b>Description:</b></dt>
                <dd><Editable disabled={props.view} html={props.proof.target} onChange={this.onTarget} placeholder="(no description)" /></dd>

                <dt className="mt3"><b>Expected result:</b></dt>
                <dd><Editable disabled={props.view} html={props.proof.expect} onChange={this.onExpect} placeholder="(no expected result)" /></dd>

                <dt className="mt3"><b>Steps:</b></dt>
                <dd><Editable className="mv0 pl0" disabled={props.view} html={stepsToList(props.proof.steps)} onChange={this.onSteps} onFocus={this.onStepsFocus} placeholder="(no steps)" tag="ol" /></dd>
            </dl>
        );
    }
}

class ProofsProof extends PureComponent {
    render (props) {
        return (
            <li>
                <a
                    className={`${getProofColor(props.proof)} db link`}
                    dangerouslySetInnerHTML={{__html: props.proof.name || '(untitled)'}}
                    href={[`/${props.proof._id}`, props.search].filter(Boolean).join('')}
                />
            </li>
        );
    }
}

class Proofs extends PureComponent {
    render (props) {
        if (props.proofs.length === 0) {
            return (
                <div className="b--dark-gray br bw1 fl h-100 mv0 overflow-auto pl4 pr3 pv3 tc w-30">
                    (no test cases)
                </div>
            );
        }

        return (
            <ul className="b--dark-gray br bw1 fl h-100 mv0 overflow-auto pl4 pr3 pv3 w-30">
                {props.proofs.map(proof =>
                    <ProofsProof key={proof._id} proof={proof} search={props.search} />
                )}
            </ul>
        );
    }
}

class Viewer extends PureComponent {
    render (props) {
        return (
            <div className="bottom-1 fixed right-1">
                <div className="b--dark-gray ba bg-white br-100 bw1 cf h2 hover-dark-pink link mb1 pointer tc w2" onClick={onAdd}>
                    {iconAdd}
                </div>

                {props.view || props.proof && (
                    <div className="b--dark-gray ba bg-white br-100 bw1 cf h2 hover-red link mb1 pointer tc w2" onClick={onRemove}>
                        {iconRemove}
                    </div>
                )}

                {props.view || (
                    <div className="b--dark-gray ba bg-white br-100 bw1 cf h2 hover-green link mb1 pointer tc w2" onClick={onSave}>
                        {iconOk}
                    </div>
                )}

                <div className={`b--dark-gray ba bg-white br-100 bw1 cf h2 hover-${props.view ? 'dark-blue' : 'blue'} link pointer tc w2`} onClick={onView}>
                    {props.view ? iconDo : iconNo}
                </div>
            </div>
        );
    }
}

export class Application extends Component {
    constructor () {
        super(...arguments);

        const watcher = this.props.tree.watch({
            error:  ['error'],
            labels: ['labels'],
            proof:  ['proof'],
            proofs: ['proofsFiltered'],
            search: ['search'],
            user:   ['user'],
            view:   ['view']
        });

        watcher.on('update', () => {
            this.setState(watcher.get());
        });

        this.state = watcher.get();
    }

    render (props, state) {
        return (
            <main className="cf dark-gray h-100 lh-copy sans-serif">
                <section className="b--dark-gray br bw1 fl flex flex-column h-100 w-20">
                    <Header />

                    {state.user ? (
                        <Labels labels={state.labels} />
                    ) : (
                        <Filler />
                    )}

                    <Account error={state.error} user={state.user} />
                </section>

                {!!state.user && (
                    <Proofs proofs={state.proofs} search={state.search} />
                )}

                {!!state.user && (
                    <Viewer proof={!!state.proof} view={state.view} />
                )}

                {!!state.user && state.proof ? (
                    <Proof labels={state.labels} proof={state.proof} view={state.view} />
                ) : (
                    <Description className={state.user ? 'w-50' : 'w-75'} />
                )}
            </main>
        );
    }
}

function getContent (disabled, html, placeholder) {
    return html ? html : (disabled && placeholder || '');
}

function getProofColor (proof) {
    return proof._created
        ? proof._removed
            ? 'gray hover-light-gray'
            : 'green hover-light-green'
        : proof._removed
            ? 'hover-light-red red'
            : proof._updated
                ? 'blue hover-light-blue'
                : 'dark-gray hover-gray'
    ;
}

function icon (d) {
    return (
        <svg className="ma1" viewBox="0 0 512 512">
            <path fill="currentColor" fillRule="evenodd" d={d} />
        </svg>
    );
}

function listToSteps (html) {
    const steps = html.split('<li>').slice(1).map(element => element.slice(0, -5));
    return steps.length ? steps : [''];
}

function stepsToList (steps) {
    return steps.map(step => `<li>${step}</li>`).join('');
}
