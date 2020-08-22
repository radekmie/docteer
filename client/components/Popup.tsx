// @flow
// @jsx h

import {Component, h} from 'preact';

const execCache = {};
const exec = command => {
  if (!execCache[command])
    execCache[command] = (event: Event) => {
      event.stopPropagation();
      document.execCommand(command, false, null);
    };
  return execCache[command];
};

type Popup$Props = {|
  node: HTMLElement,
  offsets: DOMRect,
  position: DOMRect
|};

export class Popup extends Component<Popup$Props> {
  actions = [
    {
      children: <b>B</b>,
      onClick: exec('bold'),
      title: 'Bold'
    },
    {
      children: <i>/</i>,
      onClick: exec('italic'),
      title: 'Italic'
    },
    {
      children: <u>U</u>,
      onClick: exec('underline'),
      title: 'Underline'
    },
    {
      children: <strike>S</strike>,
      onClick: exec('strikeThrough'),
      title: 'Strikethrough'
    },
    {
      children: <span>&para;</span>,
      onClick: exec('removeFormat'),
      title: 'Remove format'
    }
  ];

  render({node, offsets, position}: Popup$Props) {
    const x = position.x + position.width / 2 - offsets.x + node.scrollLeft;
    const y = position.y + position.height - offsets.y + node.scrollTop;

    return (
      <div
        class="bg-white popup"
        style={{transform: `translate(${x}px,${y}px)translate(-50%,.25em)`}}
      >
        {this.actions.map((props, index) => (
          <button
            class="bg-white bw0 dark-gray hover-bg-near-white pointer"
            key={index}
            {...props}
          />
        ))}
      </div>
    );
  }
}
