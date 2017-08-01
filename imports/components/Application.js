import Link  from 'react-router-dom/Link';
import React from 'react';

const parseFilterQuery = string =>
    string
        .replace(/^\?(.*?)filter=(.*?)(&.*?|$)/, '$2')
        .split(',')
        .filter(Boolean)
;

const buildFilterQuery = (string, _id) => {
    const parsed = parseFilterQuery(string);
    const result = parsed.includes(_id)
        ? parsed.filter(xyz => xyz != _id)
        : parsed.concat(_id)
    ;

    const query = result.filter(Boolean).sort().join(',');

    return query ? `?filter=${query}` : query;
};

class Description extends React.PureComponent {
    render () {
        return (
            <div className="fl pv3 tc w-50">
                Some description should be placed here!
            </div>
        );
    }
}

class GroupsGroupTag extends React.PureComponent {
    constructor () {
        super(...arguments);

        this.onFilter = this.onFilter.bind(this);
    }

    onFilter () {
        this.props.onFilter(this.props.tag._id);
    }

    render () {
        return (
            <li>
                <label className="db pointer" htmlFor={this.props.tag._id}>
                    <input checked={this.props.selected.includes(this.props.tag._id)} className="mr2 v-mid" id={this.props.tag._id} onChange={this.onFilter} type="checkbox" />
                    {this.props.tag.name}
                </label>
            </li>
        );
    }
}

class GroupsGroup extends React.PureComponent {
    render () {
        return (
            <div className="pt3" key={this.props.group._id}>
                <h4 className="ma0">{this.props.group.name}</h4>
                <ul className="ma0 pl3 list">
                    {this.props.group.tags.map(tag =>
                        <GroupsGroupTag key={tag._id} tag={tag} onFilter={this.props.onFilter} selected={this.props.selected} />
                    )}
                </ul>
            </div>
        );
    }
}

class Groups extends React.PureComponent {
    render () {
        return (
            <div className="overflow-auto pb3 pl3">
                {this.props.groups.map(group =>
                    <GroupsGroup group={group} key={group._id} onFilter={this.props.onFilter} selected={this.props.selected} />
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
                    <h2 className="fl f4">
                        DocTear
                    </h2>
                </Link>
            </header>
        );
    }
}

class TestCase extends React.PureComponent {
    render () {
        return (
            <dl className="fl h-100 ma0 overflow-auto pa4 w-50">
                <dt><b>Name:</b></dt>
                <dd>{this.props.testcase.name}</dd>

                <dt className="mt3"><b>Tags:</b></dt>
                <dd>
                    <ul className="mv0 pl0">
                        {this.props.testcase.tags.map(tag =>
                            <li key={tag._id}>
                                <b className="mr2">{`${tag.group.name}:`}</b>
                                <i>{tag.name}</i>
                            </li>
                        )}
                    </ul>
                </dd>

                <dt className="mt3"><b>Description:</b></dt>
                <dd>{this.props.testcase.target}</dd>

                <dt className="mt3"><b>Expect:</b></dt>
                <dd>{this.props.testcase.expect}</dd>

                <dt className="mt3"><b>Steps:</b></dt>
                <dd>
                    <ol className="mv0 pl0">
                        {this.props.testcase.steps.map((step, index) =>
                            <li key={index}>
                                {step}
                            </li>
                        )}
                    </ol>
                </dd>
            </dl>
        );
    }
}

class TestCasesTestCase extends React.PureComponent {
    render () {
        return (
            <li>
                <Link to={`/${this.props.testcase._id}${buildFilterQuery(this.props.selected.join(','))}`}>
                    {this.props.testcase.name}
                </Link>
            </li>
        );
    }
}

class TestCases extends React.PureComponent {
    render () {
        return (
            <ul className="br bw1 fl h-100 mv0 overflow-auto pl4 pv3 w-30">
                {this.props.testcases.map(testcase =>
                    this.props.selected.every(_id => testcase.tags.find(tag => tag._id === _id))
                        ? <TestCasesTestCase key={testcase._id} selected={this.props.selected} testcase={testcase} />
                        : null
                )}
            </ul>
        );
    }
}

export default class Application extends React.PureComponent {
    constructor () {
        super(...arguments);

        this.onFilter = this.onFilter.bind(this);
    }

    onFilter (_id) {
        this.props.history.push(`${this.props.location.pathname}${buildFilterQuery(this.props.location.search, _id)}`);
    }

    render () {
        return (
            <main className="cf h-100 lh-copy">
                <section className="br bw1 fl flex flex-column h-100 w-20">
                    <Header />
                    <Groups groups={this.props.groups} onFilter={this.onFilter} selected={parseFilterQuery(this.props.location.search)} />
                </section>

                <TestCases selected={parseFilterQuery(this.props.location.search)} testcases={this.props.testcases} />

                {this.props.match.params.testcase ? (
                    <TestCase testcase={this.props.testcases.find(testcase => testcase._id === this.props.match.params.testcase)} />
                ) : (
                    <Description />
                )}
            </main>
        );
    }
}
