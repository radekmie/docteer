/** @jsx h */

import {Component, h} from 'preact';

import {
    onAdd,
    onChange,
    onFilter,
    onLogin,
    onLogout,
    onRefresh,
    onRemove,
    onSave,
    onSearch,
    onView
} from '/imports/state/actions';

/* eslint-disable max-len */
const iconAdd = icon(512, 'M417.4 224H288V94.6c0-16.9-14.3-30.6-32-30.6s-32 13.7-32 30.6V224H94.6C77.7 224 64 238.3 64 256s13.7 32 30.6 32H224v129.4c0 16.9 14.3 30.6 32 30.6s32-13.7 32-30.6V288h129.4c16.9 0 30.6-14.3 30.6-32s-13.7-32-30.6-32z');
const iconDo = icon(128, 'M36.108 110.473l70.436-70.436-18.581-18.58-70.437 70.436c-.378.302-.671.716-.803 1.22l-5.476 20.803c-.01.04-.01.082-.019.121-.018.082-.029.162-.039.247-.007.075-.009.147-.009.222-.001.077.001.147.009.225.01.084.021.166.039.246.008.04.008.082.019.121.007.029.021.055.031.083.023.078.053.154.086.23.029.067.057.134.09.196.037.066.077.127.121.189.041.063.083.126.13.184.047.059.1.109.152.162.053.054.105.105.163.152.056.048.119.09.182.131.063.043.124.084.192.12.062.033.128.062.195.09.076.033.151.063.23.087.028.009.054.023.083.031.04.01.081.01.121.02.081.017.162.028.246.037.077.009.148.011.224.01.075 0 .147-.001.223-.008.084-.011.166-.022.247-.039.04-.01.082-.01.121-.02l20.804-5.475c.505-.132.92-.425 1.22-.805zm-16.457-2.124c-.535-.535-1.267-.746-1.964-.649l3.183-12.094 11.526 11.525-12.096 3.182c.098-.697-.112-1.429-.649-1.964zm90.051-71.47l-18.58-18.581 7.117-7.117s12.656 4.514 18.58 18.582l-7.117 7.116z');
const iconNo = icon(512, 'M443.6 387.1L312.4 255.4l131.5-130c5.4-5.4 5.4-14.2 0-19.6l-37.4-37.6c-2.6-2.6-6.1-4-9.8-4-3.7 0-7.2 1.5-9.8 4L256 197.8 124.9 68.3c-2.6-2.6-6.1-4-9.8-4-3.7 0-7.2 1.5-9.8 4L68 105.9c-5.4 5.4-5.4 14.2 0 19.6l131.5 130L68.4 387.1c-2.6 2.6-4.1 6.1-4.1 9.8 0 3.7 1.4 7.2 4.1 9.8l37.4 37.6c2.7 2.7 6.2 4.1 9.8 4.1 3.5 0 7.1-1.3 9.8-4.1L256 313.1l130.7 131.1c2.7 2.7 6.2 4.1 9.8 4.1 3.5 0 7.1-1.3 9.8-4.1l37.4-37.6c2.6-2.6 4.1-6.1 4.1-9.8-.1-3.6-1.6-7.1-4.2-9.7z');
const iconOk = icon(512, 'M448 71.9c-17.3-13.4-41.5-9.3-54.1 9.1L214 344.2l-99.1-107.3c-14.6-16.6-39.1-17.4-54.7-1.8-15.6 15.5-16.4 41.6-1.7 58.1 0 0 120.4 133.6 137.7 147 17.3 13.4 41.5 9.3 54.1-9.1l206.3-301.7c12.6-18.5 8.7-44.2-8.6-57.5z');
const iconRemove = icon(512, 'M417.4 224H94.6C77.7 224 64 238.3 64 256s13.7 32 30.6 32h322.8c16.9 0 30.6-14.3 30.6-32s-13.7-32-30.6-32z');
const iconRefresh = icon(1792, 'M1639 1056q0 5-1 7-64 268-268 434.5T892 1664q-146 0-282.5-55T366 1452l-129 129q-19 19-45 19t-45-19-19-45v-448q0-26 19-45t45-19h448q26 0 45 19t19 45-19 45l-137 137q71 66 161 102t187 36q134 0 250-65t186-179q11-17 53-117 8-23 30-23h192q13 0 22.5 9.5t9.5 22.5zm25-800v448q0 26-19 45t-45 19h-448q-26 0-45-19t-19-45 19-45l138-138q-148-137-349-137-134 0-250 65T460 628q-11 17-53 117-8 23-30 23H178q-13 0-22.5-9.5T146 736v-7q65-268 270-434.5T896 128q146 0 284 55.5T1425 340l130-129q19-19 45-19t45 19 19 45z');
/* eslint-enable max-len */

class PureComponent extends Component {
    shouldComponentUpdate (props) {
        for (const key in props) {
            if (this.props[key] !== props[key]) {
                return true;
            }
        }

        for (const key in props) {
            if (!(key in props)) {
                return true;
            }
        }

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

        if (!this.email || !this.password) {
            return;
        }

        onLogin(this.email.value, this.password.value);
    };

    render (props) {
        return (
            <form class="b--dark-gray bt bw1 pa1" onSubmit={this.onSubmit}>
                {!!props.user && (
                    <div class="mb1 tc w-100">
                        <b>{props.user.emails[0].address}</b>
                    </div>
                )}

                {!!props.user && (
                    <button class="w-100" onClick={onLogout} title="Log Out">
                        Log Out
                    </button>
                )}

                {!!props.user || (
                    <label class="flex mb1" htmlFor="email" title="Email">
                        <code><b>L</b></code>
                        <input class={`bg-${props.error ? 'washed-red' : 'near-white'} bw0 flex-auto ml1 ph1`} id="email" name="email" ref={this.onRefEmail} type="email" />
                    </label>
                )}

                {!!props.user || (
                    <label class="flex mb1" htmlFor="password" title="Password">
                        <code><b>P</b></code>
                        <input class={`bg-${props.error ? 'washed-red' : 'near-white'} bw0 flex-auto ml1 ph1`} id="password" name="password" ref={this.onRefPassword} type="password" />
                    </label>
                )}

                {!!props.user || (
                    <button class="w-100" title="Log In">
                        Log In
                    </button>
                )}
            </form>
        );
    }
}

class Editable extends Component {
    onRef = element => this.element = element;
    onChange = () => {
        if (!this.props.onChange) {
            return;
        }

        if (!this.element) {
            return;
        }

        if (this.element.innerHTML === this.props.html) {
            return;
        }

        this.props.onChange(this.element.innerHTML);
    };

    shouldComponentUpdate (props) {
        if (!this.element) {
            return true;
        }

        if (this.props.disabled !== props.disabled) {
            return true;
        }

        if (this.props.html !== props.html && this.element.innerHTML !== props.html) {
            return true;
        }

        if ((props.tag === 'ol' || props.tag === 'ul') && !this.element.innerHTML.startsWith('<li>')) {
            return true;
        }

        return false;
    }

    componentDidUpdate () {
        if (this.element && this.element.innerHTML !== this.props.html) {
            this.element.innerHTML = getContent(this.props.disabled, this.props.html, this.props.placeholder);
        }
    }

    render ({disabled, html, placeholder, tag, ...props}) {
        return h(tag || 'div', Object.assign(props, {
            class: ['ph1', props.class, disabled ? '' : 'bg-near-white'].filter(Boolean).join(' '),
            contentEditable: !disabled,
            dangerouslySetInnerHTML: {__html: getContent(disabled, html, placeholder)},

            onBlur:   this.onChange,
            onChange: this.onChange,
            ref:      this.onRef
        }));
    }
}

class Description extends PureComponent {
    render (props) {
        return (
            <div class={`fl pt3 tc ${props.class}`}>
                Some description should be placed here!
            </div>
        );
    }
}

class LabelsLabel extends PureComponent {
    onFilter = () => {
        onFilter(this.props.label.name);
    };

    render (props) {
        return (
            <li>
                <label class="flex hover-gray items-center link ph2 pointer" htmlFor={props.label.name}>
                    <input checked={props.label.active} id={props.label.name} onChange={this.onFilter} type="checkbox" />
                    <div class="flex-auto mh2 truncate">
                        {props.label.name}
                    </div>
                    <div>
                        {`${props.label.count}/${props.label.total}`}
                    </div>
                </label>
            </li>
        );
    }
}

class Filler extends PureComponent {
    render () {
        return (
            <div class="filler flex-auto near-white" />
        );
    }
}

class Labels extends PureComponent {
    render (props) {
        if (props.labels.length === 0) {
            return (
                <div class="flex-auto pa3 tc">
                    (no labels)
                </div>
            );
        }

        return (
            <div class="flex-auto list overflow-auto">
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
            <header class="b--dark-gray bb bw1 cf pt1">
                <a class="dark-gray hover-gray link" href="/">
                    <svg class="fl w3" viewBox="0 0 32 32">
                        <path d="M7 21v4h1v-4zm10 0v4h1v-4" />
                        <path d="M9 21v3h1v-3zm16 0v3h1v-3" />
                        <path d="M11 21v6h1v-6zm10 0v6h1v-6" />
                        <path d="M13 21v2h1v-2zm6 0v2h1v-2" />
                        <path d="M15 21v5h1v-5zm8 0v5h1v-5" />
                        <path d="M27 20H6v2H5v-5h1v2h21v-2h1v5h-1v-2zm-1-2v-8l-6-7H9C7 3 7 4 7 5v13h1V5c0-1 0-1 1-1h10v5c0 1 1 2 2 2h4v7z" />
                    </svg>

                    <h1 class="fl f4">
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
        if (!this.props.proof[key].length) {
            onChange(this.props.proof._id, key, ['']);
        }
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
            <dl class="fl h-100 ma0 overflow-auto pa4 w-50">
                <dt><b>Name:</b></dt>
                <dd class="ml4"><Editable disabled={props.view} html={props.proof.name} onChange={this.onName} placeholder="(untitled)" /></dd>

                <dt class="mt3"><b>Labels:</b></dt>
                <dd class="ml4"><Editable class="mv0 pl0" disabled={props.view} html={stepsToList(props.proof.labels)} onChange={this.onLabels} onFocus={this.onLabelsFocus} placeholder="(no labels)" tag="ul" /></dd>

                <dt class="mt3"><b>Description:</b></dt>
                <dd class="ml4"><Editable disabled={props.view} html={props.proof.target} onChange={this.onTarget} placeholder="(no description)" /></dd>

                <dt class="mt3"><b>Expected result:</b></dt>
                <dd class="ml4"><Editable disabled={props.view} html={props.proof.expect} onChange={this.onExpect} placeholder="(no expected result)" /></dd>

                <dt class="mt3"><b>Steps:</b></dt>
                <dd class="ml4"><Editable class="mv0 pl0" disabled={props.view} html={stepsToList(props.proof.steps)} onChange={this.onSteps} onFocus={this.onStepsFocus} placeholder="(no steps)" tag="ol" /></dd>
            </dl>
        );
    }
}

class ProofsProof extends PureComponent {
    render (props) {
        return (
            <a
                class={`db ${getProofColor(props.proof)} link pl3 truncate`}
                dangerouslySetInnerHTML={{__html: props.proof.name || '(untitled)'}}
                href={[`/${props.proof._id}`, props.filter].filter(Boolean).join('')}
            />
        );
    }
}

class Proofs extends PureComponent {
    onSearch = event => {
        onSearch(event.target.value);
    };

    render (props) {
        return (
            <div class="b--dark-gray br bw1 fl flex flex-column h-100 mv0 w-30">
                <div class="b--dark-gray bb bw1">
                    <label class="flex" htmlFor="search" title="Search">
                        <input class="bg-near-white bw0 flex-auto pa2" id="search" name="search" placeholder="Search..." onChange={this.onSearch} type="search" value={props.search} />
                    </label>
                </div>

                {props.proofs.length ? (
                    <div class="ma0 overflow-auto">
                        {props.proofs.map(proof =>
                            <ProofsProof filter={props.filter} key={proof._id} proof={proof} />
                        )}
                    </div>
                ) : (
                    <div class="pa3 tc">
                        {`(no test cases${props.search ? ' found' : ''})`}
                    </div>
                )}
            </div>
        );
    }
}

class Viewer extends PureComponent {
    render (props) {
        return (
            <div class="bottom-1 fixed right-1">
                <div class={getButtonClasses('dark-pink')} onClick={onAdd} title="Create">
                    {iconAdd}
                </div>

                {props.view || props.proof && (
                    <div class={getButtonClasses('red')} onClick={onRemove} title="Remove">
                        {iconRemove}
                    </div>
                )}

                {props.view || (
                    <div class={getButtonClasses('green')} onClick={onSave} title="Save">
                        {iconOk}
                    </div>
                )}

                <div class={getButtonClasses(props.view ? 'dark-blue' : 'blue')} onClick={onView} title={props.view ? 'Edit' : 'Cancel'}>
                    {props.view ? iconDo : iconNo}
                </div>

                <div class={getButtonClasses('orange')} onClick={onRefresh} title="Refresh">
                    {iconRefresh}
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
            filter: ['filterString'],
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
            <main class="cf dark-gray h-100 lh-copy sans-serif">
                <section class="b--dark-gray br bw1 fl flex flex-column h-100 w-20">
                    <Header />

                    {state.user ? (
                        <Labels labels={state.labels} />
                    ) : (
                        <Filler />
                    )}

                    <Account error={state.error} user={state.user} />
                </section>

                {!!state.user && (
                    <Proofs filter={state.filter} proofs={state.proofs} search={state.search} />
                )}

                {!!state.user && state.proof ? (
                    <Proof labels={state.labels} proof={state.proof} view={state.view} />
                ) : (
                    <Description class={state.user ? 'w-50' : 'w-75'} />
                )}

                {!!state.user && (
                    <Viewer proof={!!state.proof} view={state.view} />
                )}
            </main>
        );
    }
}

function getButtonClasses (color) {
    return `b--dark-gray ba bg-white br-100 bw1 cf h2 hover-${color} link mb1 pointer tc w2`;
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

function icon (size, d) {
    return (
        <svg class="ma1" viewBox={`0 0 ${size} ${size}`}>
            <path d={d} />
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
