/** @jsx h */

import {Component, h} from 'preact';

import {onChange}      from '/imports/state/actions';
import {schemaIsArray} from '/imports/lib/schemas';
import {schemaKey}     from '/imports/lib/schemas';

class Editable extends Component {
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

    onElement = element => {
        this.element = element;
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
            this.element.innerHTML = content(this.props.disabled, this.props.html);
        }
    }

    render ({disabled, html, tag, ...props}) {
        return h(tag, Object.assign(props, {
            class: ['ph1', props.class, disabled ? '' : 'bg-near-white'].filter(Boolean).join(' '),
            contentEditable: !disabled,
            dangerouslySetInnerHTML: {__html: content(disabled, html)},

            onBlur:   this.onChange,
            onChange: this.onChange,
            ref:      this.onElement
        }));
    }
}

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
                    if (props.view && key !== 'name' && !props.doc[key].length) {
                        return fields;
                    }

                    fields.push(<dt key={`${key}-dt`} class={index === 0 ? null : 'mt3'}><b>{`${schemaKey(key)}:`}</b></dt>);
                    fields.push(<dd key={`${key}-dd`} class="ml4"><Editable class={schemaIsArray(props.doc._outline[key]) ? 'mv0 pl0' : null} disabled={props.view} html={this.transform(key, props.doc[key])} onChange={this.onChange(key)} onFocus={this.onFocus(key)} tag={props.doc._outline[key]} /></dd>);

                    return fields;
                }, [])}
            </dl>
        );
    }
}

function content (disabled, html) {
    return html ? html : (disabled ? '(untitled)' : '');
}

function listToSteps (html) {
    const  steps = html.split('<li>').slice(1).map(element => element.slice(0, -5));
    return steps.length ? steps : [''];
}

function stepsToList (steps) {
    return steps.map(step => `<li>${step}</li>`).join('');
}
