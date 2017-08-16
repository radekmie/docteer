/** @jsx h */

import {Component, h} from 'preact';

import {onChange} from '/imports/state/actions';

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
            this.element.innerHTML = content(this.props.disabled, this.props.html, this.props.placeholder);
        }
    }

    render ({disabled, html, placeholder, tag, ...props}) {
        return h(tag || 'div', Object.assign(props, {
            class: ['ph1', props.class, disabled ? '' : 'bg-near-white'].filter(Boolean).join(' '),
            contentEditable: !disabled,
            dangerouslySetInnerHTML: {__html: content(disabled, html, placeholder)},

            onBlur:   this.onChange,
            onChange: this.onChange,
            ref:      this.onElement
        }));
    }
}

export class Proof extends Component {
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

    onFocusLabels = this.onEnsure('labels');
    onFocusSteps  = this.onEnsure('steps');

    render (props) {
        return (
            <dl class="fl h-100 ma0 overflow-auto pa4 w-50">
                <dt><b>Name:</b></dt>
                <dd class="ml4"><Editable disabled={props.view} html={props.proof.name} onChange={this.onName} placeholder="(untitled)" /></dd>

                <dt class="mt3"><b>Labels:</b></dt>
                <dd class="ml4"><Editable class="mv0 pl0" disabled={props.view} html={stepsToList(props.proof.labels)} onChange={this.onLabels} onFocus={this.onFocusLabels} placeholder="(no labels)" tag="ul" /></dd>

                <dt class="mt3"><b>Description:</b></dt>
                <dd class="ml4"><Editable disabled={props.view} html={props.proof.target} onChange={this.onTarget} placeholder="(no description)" /></dd>

                <dt class="mt3"><b>Expected result:</b></dt>
                <dd class="ml4"><Editable disabled={props.view} html={props.proof.expect} onChange={this.onExpect} placeholder="(no expected result)" /></dd>

                <dt class="mt3"><b>Steps:</b></dt>
                <dd class="ml4"><Editable class="mv0 pl0" disabled={props.view} html={stepsToList(props.proof.steps)} onChange={this.onSteps} onFocus={this.onFocusSteps} placeholder="(no steps)" tag="ol" /></dd>
            </dl>
        );
    }
}

function content (disabled, html, placeholder) {
    return html ? html : (disabled && placeholder || '');
}

function listToSteps (html) {
    const  steps = html.split('<li>').slice(1).map(element => element.slice(0, -5));
    return steps.length ? steps : [''];
}

function stepsToList (steps) {
    return steps.map(step => `<li>${step}</li>`).join('');
}
