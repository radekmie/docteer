// @flow
// @jsx h

import {Component} from 'preact';
import {h} from 'preact';

type Editable$Props = {|
  class?: string,
  disabled: boolean,
  html: string,
  onChange: string => void,
  tag: string
|};

export class Editable extends Component<Editable$Props> {
  element: ?HTMLElement;

  onChange = () => {
    if (!this.props.onChange) return;

    if (!this.element) return;

    // $FlowFixMe: Hard to define this constraint.
    const value = this.element[
      this.props.tag === 'textarea' ? 'value' : 'innerHTML'
    ];

    if (value === this.props.html) return;

    this.props.onChange(value);
  };

  onElement = (element: ?HTMLElement) => {
    this.element = element;
  };

  shouldComponentUpdate(props: Editable$Props) {
    if (!this.element) return true;

    if (this.props.disabled !== props.disabled) return true;

    if (this.props.html !== props.html && this.element.innerHTML !== props.html)
      return true;

    if (
      (props.tag === 'ol' || props.tag === 'ul') &&
      !this.element.innerHTML.startsWith('<li>')
    )
      return true;

    return false;
  }

  componentDidUpdate() {
    if (this.element && this.element.innerHTML !== this.props.html)
      // $FlowFixMe: Weird.
      this.element.innerHTML = content(this.props.disabled, this.props.html);
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

        onBlur: this.onChange,
        onChange: this.onChange,
        onInput: tag === 'textarea' ? this.onChange : undefined,
        ref: this.onElement,
        rows: tag === 'textarea' ? (__html.match(/\n/g) || []).length + 1 : null
      })
    );
  }
}

function content(disabled, html) {
  return html ? html : disabled ? '(untitled)' : '';
}
