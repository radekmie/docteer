/** @jsx h */

import {Component, h} from 'preact';

import {onChange} from '/imports/state/actions';
import {
    schemaIsArray,
    schemaKey
} from '/imports/lib/schemas';

import {Editable} from './Editable';

export class Doc extends Component {
    onChangeMap = {};
    onChange = key => {
        return this.onChangeMap[key] = this.onChangeMap[key] || (html => {
            onChange(this.props.doc._id, key, schemaIsArray(this.props.doc._outline[key]) ? listToSteps(html) : html);
        });
    };

    onFocusMap = {};
    onFocus = key => {
        if (!schemaIsArray(this.props.doc._outline[key])) {
            return undefined;
        }

        return this.onFocusMap[key] = this.onFocusMap[key] || (() => {
            if (!this.props.doc[key].length) {
                onChange(this.props.doc._id, key, ['']);
            }
        });
    };

    transform = (key, html) => schemaIsArray(this.props.doc._outline[key]) ? stepsToList(html) : html;

    render (props) {
        return (
            <dl class="fl h-100 ma0 overflow-auto pa3 w-50">
                {Object.keys(props.doc._outline).reduce((fields, key, index) => {
                    if (props.edit || key === 'name' || props.doc[key].length) {
                        fields.push(
                            <dt key={`${key}-dt`} class={index === 0 ? null : 'mt3'}>
                                <b>{`${schemaKey(key)}:`}</b>
                            </dt>
                        );

                        fields.push(
                            <dd key={`${key}-dd`} class="ml4">
                                <Editable
                                    class={schemaIsArray(props.doc._outline[key]) ? 'mv0 pl0' : null}
                                    disabled={!props.edit}
                                    html={this.transform(key, props.doc[key])}
                                    onChange={this.onChange(key)}
                                    onFocus={this.onFocus(key)}
                                    tag={props.doc._outline[key]}
                                />
                            </dd>
                        );
                    }

                    return fields;
                }, [])}
            </dl>
        );
    }
}

function listToSteps (html) {
    const  steps = html.split('<li>').slice(1).map(element => element.slice(0, -5));
    return steps.length ? steps : [''];
}

function stepsToList (steps) {
    return steps.map(step => `<li>${step}</li>`).join('');
}
