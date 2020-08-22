import { Component, h } from 'preact';

import { SchemaOutlineFieldType } from '../../types';

type Editable$Props = {
  className?: string | null | undefined;
  disabled: boolean;
  html: string;
  onChange: (value: string) => void;
  onFocus?: (event: InputEvent) => void;
  onInput?: (event: InputEvent) => void;
  onKeyDown?: (event: KeyboardEvent) => void;
  onKeyUp?: (event: KeyboardEvent) => void;
  tag: SchemaOutlineFieldType;
};

export class Editable extends Component<Editable$Props> {
  componentDidMount() {
    this.componentDidUpdate(this.props);
  }

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

  componentDidUpdate(props: Editable$Props) {
    const element = this.element;
    if (element) {
      if (element.innerHTML !== this.props.html) {
        element.innerHTML = content(this.props.disabled, this.props.html);
      }

      if (this.props.tag === 'textarea') {
        element.style.height = element.scrollHeight + 'px';
      } else if (props.tag === 'textarea') {
        element.style.height = '';
      }
    }
  }

  element: HTMLElement | null | undefined;

  onChange = () => {
    if (this.element && this.props.onChange) {
      const value = this.element[
        this.element.tagName.toLowerCase() === 'textarea'
          ? 'value'
          : 'innerHTML'
      ];

      if (value !== this.props.html) {
        this.props.onChange(value as string);
      }
    }
  };

  onElement = (element: HTMLElement | null | undefined) => {
    this.element = element;
  };

  render({ html, tag: Tag, ...props }: Editable$Props) {
    const __html = content(props.disabled, html);
    const className = [
      'db bw0 ph1 w-100',
      props.className,
      props.disabled ? '' : 'bg-near-white',
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <Tag
        {...props}
        className={className}
        contentEditable={!props.disabled}
        dangerouslySetInnerHTML={{ __html }}
        onBlur={this.onChange}
        onChange={this.onChange}
        // @ts-expect-error Invalid event type.
        onInput={Tag === 'textarea' ? this.onChange : props.onInput}
        ref={this.onElement}
        // @ts-expect-error Use `undefined` instead of `null`.
        rows={Tag === 'textarea' ? 1 : null}
        value={Tag === 'textarea' ? __html : undefined}
      />
    );
  }
}

function content(disabled: boolean, html: string) {
  return html || (disabled ? '(untitled)' : '');
}
