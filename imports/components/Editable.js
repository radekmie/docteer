// @flow
// @jsx h

import {Component} from 'preact';
import {h} from 'preact';

type Editable$Props = {
  disabled: ?boolean,
  html: string,
  onChange: string => void,
  tag: string
};

export class Editable extends Component<Editable$Props> {
  element: ?HTMLElement;

  onChange = () => {
    if (!this.props.onChange) return;

    if (!this.element) return;

    if (this.element.innerHTML === this.props.html) return;

    this.props.onChange(this.element.innerHTML);
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

  render() {
    const {disabled, html, tag, ...props} = this.props;

    return h(
      tag,
      Object.assign(props, {
        class: ['ph1', props.class, disabled ? '' : 'bg-near-white']
          .filter(Boolean)
          .join(' '),
        contentEditable: !disabled,
        dangerouslySetInnerHTML: {__html: content(disabled, html)},

        onBlur: this.onChange,
        onChange: this.onChange,
        ref: this.onElement
      })
    );
  }
}

function content(disabled, html) {
  return html ? html : disabled ? '(untitled)' : '';
}
