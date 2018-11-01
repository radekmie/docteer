// @flow
// @jsx h

import {Component} from 'preact';
import {h} from 'preact';

import type {InputEventType} from '@types';
import type {KeyboardEventType} from '@types';

type Editable$Props = {|
  class?: ?string,
  disabled: boolean,
  html: string,
  onChange: string => void,
  onFocus?: InputEventType => void,
  onInput?: InputEventType => void,
  onKeyDown?: KeyboardEventType => void,
  onKeyUp?: KeyboardEventType => void,
  tag: string
|};

export class Editable extends Component<Editable$Props> {
  element: ?HTMLElement;

  onChange = () => {
    if (this.element && this.props.onChange) {
      // $FlowFixMe: Hard to define this constraint.
      const value = this.element[
        this.element.tagName.toLowerCase() === 'textarea'
          ? 'value'
          : 'innerHTML'
      ];

      if (value !== this.props.html) this.props.onChange(value);
    }
  };

  onElement = (element: ?HTMLElement) => {
    this.element = element;
  };

  shouldComponentUpdate(props: Editable$Props) {
    return (
      // Not yet rendered.
      !this.element ||
      // Props changed.
      this.props.disabled !== props.disabled ||
      this.props.tag !== props.tag ||
      // Content changed.
      (this.props.html !== props.html &&
        this.element.innerHTML !== props.html) ||
      // Refresh.
      ((props.tag === 'ol' || props.tag === 'ul') &&
        !this.element.innerHTML.startsWith('<li>'))
    );
  }

  componentDidMount() {
    this.componentDidUpdate();
  }

  componentDidUpdate() {
    const element = this.element;
    if (element) {
      if (element.innerHTML !== this.props.html)
        element.innerHTML = content(this.props.disabled, this.props.html);

      element.style.height = '';
      if (this.props.tag === 'textarea')
        element.style.height = element.scrollHeight + 'px';
    }
  }

  // $FlowFixMe
  render({disabled, html, tag, ...props}: Editable$Props) {
    const __html = content(disabled, html);

    return h(
      tag,
      Object.assign({}, props, {
        class: [
          'db bw0 ph1 w-100',
          props.class,
          disabled ? '' : 'bg-near-white'
        ]
          .filter(Boolean)
          .join(' '),
        contentEditable: !disabled,
        disabled,
        dangerouslySetInnerHTML: {__html},
        value: tag === 'textarea' ? __html : undefined,

        onBlur: this.onChange,
        onChange: this.onChange,
        onInput: tag === 'textarea' ? this.onChange : props.onInput,
        ref: this.onElement,
        rows: tag === 'textarea' ? 1 : null
      })
    );
  }
}

function content(disabled, html) {
  return html ? html : disabled ? '(untitled)' : '';
}
