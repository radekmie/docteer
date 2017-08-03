import Link     from 'react-router-dom/Link';
import React    from 'react';
import {branch} from 'baobab-react/higher-order';

import {history} from '/imports/state';

const Description = () =>
    <div className="fl pv3 tc w-50">
        Some description should be placed here!
    </div>
;

const GroupsGroupTag = props =>
    <li>
        <label className="db pointer" htmlFor={props.label._id}>
            <input
                checked={!!props.filter && props.filter.includes(props.label._id)}
                className="mr2 v-mid"
                id={props.label._id}
                onChange={() => props.onFilter(props.label._id)}
                type="checkbox"
            />
            {props.label.name}
        </label>
    </li>
;

const GroupsGroup = props =>
    <div className="pt3" key={props.group._id}>
        <h4 className="ma0">{props.group.name}</h4>
        <ul className="ma0 pl3 list">
            {props.group.labels.map(label =>
                <GroupsGroupTag filter={props.filter} key={label._id} label={label} onFilter={props.onFilter} />
            )}
        </ul>
    </div>
;

const Groups = props =>
    <div className="overflow-auto pb3 pl3">
        {props.groups.map(group =>
            <GroupsGroup filter={props.filter} group={group} key={group._id} onFilter={props.onFilter} />
        )}
    </div>
;

const Header = () =>
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

            <h2 className="fl f4">
                DocTear
            </h2>
        </Link>
    </header>
;

const Proof = props =>
    <dl className="fl h-100 ma0 overflow-auto pa4 w-50">
        <dt><b>Name:</b></dt>
        <dd>{props.proof.name}</dd>

        <dt className="mt3"><b>Labels:</b></dt>
        <dd>
            <ul className="mv0 pl0">
                {props.proof.labels.map(label =>
                    <li key={label._id}>
                        <b className="mr2">{`${label.group.name}:`}</b>
                        <i>{label.name}</i>
                    </li>
                )}
            </ul>
        </dd>

        <dt className="mt3"><b>Description:</b></dt>
        <dd>{props.proof.target}</dd>

        <dt className="mt3"><b>Expect:</b></dt>
        <dd>{props.proof.expect}</dd>

        <dt className="mt3"><b>Steps:</b></dt>
        <dd>
            <ol className="mv0 pl0">
                {props.proof.steps.map((step, index) =>
                    <li key={index}>
                        {step}
                    </li>
                )}
            </ol>
        </dd>
    </dl>
;

const ProofsProof = props =>
    <li>
        <Link to={{pathname: props.proof._id, search: history.location.search}}>
            {props.proof.name}
        </Link>
    </li>
;

const Proofs = props =>
    <ul className="br bw1 fl h-100 mv0 overflow-auto pl4 pv3 w-30">
        {props.proofs.map(proof =>
            <ProofsProof key={proof._id} proof={proof} />
        )}
    </ul>
;

const Application = branch(props => ({
    filter: ['proofsFilter'],
    groups: ['groups'],
    proof:  ['proofs', {_id: props.match.params.proof}],
    proofs: ['proofsFiltered']
}), props =>
    <main className="cf h-100 lh-copy">
        <section className="br bw1 fl flex flex-column h-100 w-20">
            <Header />
            <Groups filter={props.filter} groups={props.groups} onFilter={_id => props.dispatch(tree => tree.get('proofsFilter').includes(_id) ? tree.set('proofsFilter', tree.get('proofsFilter').filter(filter => filter !== _id)) : tree.push('proofsFilter', _id))} />
        </section>

        <Proofs proofs={props.proofs} />

        {props.proof ? (
            <Proof proof={props.proof} />
        ) : (
            <Description />
        )}
    </main>
);

export default Application;
