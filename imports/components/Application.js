import Link     from 'react-router-dom/Link';
import React    from 'react';
import {branch} from 'baobab-react/higher-order';

class Editable extends React.PureComponent {
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

        if (props.tag === 'ol' && !this.element.innerHTML.startsWith('<li>'))
            return true;

        return false;
    }

    componentDidUpdate () {
        if (this.element && this.element.innerHTML !== this.props.html)
            this.element.innerHTML = this.props.html;
    }

    render () {
        const {disabled, html, tag, ...props} = this.props;

        return React.createElement(tag || 'div', Object.assign(props, {
            contentEditable: !disabled,
            dangerouslySetInnerHTML: {__html: html},

            onBlur:  this.onChange,
            onInput: this.onChange,
            ref:     this.onRef
        }));
    }
}

class Description extends React.PureComponent {
    render () {
        return (
            <div className="fl pv3 tc w-50">
                Some description should be placed here!
            </div>
        );
    }
}

class LabelsLabel extends React.PureComponent {
    onFilter = () => this.props.onFilter(this.props.label._id);

    render () {
        return (
            <li>
                <label className="db pointer" htmlFor={this.props.label._id}>
                    <input checked={this.props.filter.includes(this.props.label._id)} className="mr2 v-mid" id={this.props.label._id} onChange={this.onFilter} type="checkbox" />
                    {this.props.label.name}
                </label>
            </li>
        );
    }
}

class Labels extends React.PureComponent {
    render () {
        return (
            <div className="list overflow-auto pb3 pl3">
                {this.props.labels.map(label =>
                    <LabelsLabel
                        filter={this.props.filter}
                        key={label._id}
                        label={label}
                        onFilter={this.props.onFilter}
                    />
                )}
            </div>
        );
    }
}

class Header extends React.PureComponent {
    render () {
        return (
            <header className="bb bw1 cf ph3 pv1">
                <Link to="/">
                    <svg className="fl w3" viewBox="0 0 32 32">
                        <path d="M7 21v4h1v-4zm10 0v4h1v-4" />
                        <path d="M9 21v3h1v-3zm16 0v3h1v-3" />
                        <path d="M11 21v6h1v-6zm10 0v6h1v-6" />
                        <path d="M13 21v2h1v-2zm6 0v2h1v-2" />
                        <path d="M15 21v5h1v-5zm8 0v5h1v-5" />
                        <path d="M27 20H6v2H5v-5h1v2h21v-2h1v5h-1v-2zm-1-2v-8l-6-7H9C7 3 7 4 7 5v13h1V5c0-1 0-1 1-1h10v5c0 1 1 2 2 2h4v7z" />
                    </svg>

                    <h1 className="black dim fl f4 link">
                        DocTear
                    </h1>
                </Link>
            </header>
        );
    }
}

class Proof extends React.PureComponent {
    onChange = (key, map) => html => this.props.onChange(this.props.proof._id, key, map ? map(html) : html);

    onExpect = this.onChange('expect');
    onName   = this.onChange('name');
    onSteps  = this.onChange('steps', listToSteps);
    onTarget = this.onChange('target');

    render () {
        return (
            <dl className="fl h-100 ma0 overflow-auto pa4 w-50">
                <dt><b>Name:</b></dt>
                <dd><Editable disabled={this.props.view} html={this.props.proof.name} onChange={this.onName} /></dd>

                <dt className="mt3"><b>Labels:</b></dt>
                <dd>
                    <ul className="mv0 pl0">
                        {this.props.proof.labels.map(_id =>
                            <li key={_id}>
                                <i>{this.props.labels.find(label => label._id === _id).name}</i>
                            </li>
                        )}
                    </ul>
                </dd>

                <dt className="mt3"><b>Description:</b></dt>
                <dd><Editable disabled={this.props.view} html={this.props.proof.target} onChange={this.onTarget} /></dd>

                <dt className="mt3"><b>Expect:</b></dt>
                <dd><Editable disabled={this.props.view} html={this.props.proof.expect} onChange={this.onExpect} /></dd>

                <dt className="mt3"><b>Steps:</b></dt>
                <dd><Editable className="mv0 pl0" disabled={this.props.view} html={stepsToList(this.props.proof.steps)} onChange={this.onSteps} tag="ol" /></dd>
            </dl>
        );
    }
}

class ProofsProof extends React.PureComponent {
    render () {
        return (
            <li>
                <Link className="black dim link" to={{pathname: this.props.proof._id, search: this.props.search}}>
                    {this.props.proof.name}
                </Link>
            </li>
        );
    }
}

class Proofs extends React.PureComponent {
    render () {
        return (
            <ul className="br bw1 fl h-100 mv0 overflow-auto pl4 pv3 w-30">
                {this.props.proofs.map(proof =>
                    <ProofsProof key={proof._id} proof={proof} search={this.props.search} />
                )}
            </ul>
        );
    }
}

class Viewer extends React.PureComponent {
    render () {
        return (
            <div className="bb bw1 cf ph3 pointer pv1 tc" onClick={this.props.onView}>
                {this.props.load ? '~~LOAD~~' : this.props.view ? '~~VIEW~~' : '~~EDIT~~'}
            </div>
        );
    }
}

const Application = branch(props => ({
    filter: ['proofsFilter'],
    labels: ['labels'],
    load:   ['load'],
    proof:  ['proofs', {_id: props.match.params.proof}],
    proofs: ['proofsFiltered'],
    view:   ['view']
}), class Application extends React.PureComponent {
    onChange = (_id, key, value) =>
        this.props.dispatch(tree => {
            if (tree.get(['proofsLocal', _id])) {
                if (JSON.stringify(tree.get(['proofsRemote', {_id}])[key]) === JSON.stringify(value)) {
                    if (Object.keys(tree.get(['proofsLocal', _id])).length === 1) {
                        tree.unset(['proofsLocal', _id]);
                    } else {
                        tree.unset(['proofsLocal', _id, key]);
                    }
                } else {
                    tree.set(['proofsLocal', _id, key], value);
                }
            } else {
                tree.set(['proofsLocal', _id], value);
            }
        })
    ;

    onFilter = _id =>
        this.props.dispatch(tree => {
            const index = tree.get(['proofsFilter']).indexOf(_id);

            if (index === -1) {
                tree.push(['proofsFilter'], _id);
            } else {
                tree.unset(['proofsFilter', index]);
            }
        })
    ;

    onView = () =>
        this.props.dispatch(tree => tree.set('view', !tree.get('view')))
    ;

    render () {
        return (
            <main className="cf h-100 lh-copy">
                <section className="br bw1 fl flex flex-column h-100 w-20">
                    <Header />
                    <Viewer load={this.props.load} onView={this.onView} view={this.props.view} />
                    <Labels filter={this.props.filter} labels={this.props.labels} onFilter={this.onFilter} />
                </section>

                <Proofs proofs={this.props.proofs} search={this.props.location.search} />

                {this.props.proof ? (
                    <Proof labels={this.props.labels} onChange={this.onChange} proof={this.props.proof} view={this.props.view} />
                ) : (
                    <Description />
                )}
            </main>
        );
    }
});

function listToSteps (html) {
    const steps = html.split('<li>').slice(1).map(element => element.slice(0, -5));
    return steps.length ? steps : [''];
}

function stepsToList (steps) {
    return steps.map(step => `<li>${step}</li>`).join('');
}

export default Application;
