import { Component, h } from 'preact';

const execCache: Record<string, (event: Event) => void> = Object.create(null);
const exec = (command: string) => {
  if (!execCache[command]) {
    execCache[command] = (event: Event) => {
      event.stopPropagation();
      // @ts-expect-error Is `null` valid here?
      document.execCommand(command, false, null);
    };
  }
  return execCache[command];
};

type Popup$Props = {
  node: HTMLElement;
  offsets: DOMRect;
  position: DOMRect;
};

export class Popup extends Component<Popup$Props> {
  actions = [
    {
      children: <b>B</b>,
      onClick: exec('bold'),
      title: 'Bold',
    },
    {
      children: <i>/</i>,
      onClick: exec('italic'),
      title: 'Italic',
    },
    {
      children: <u>U</u>,
      onClick: exec('underline'),
      title: 'Underline',
    },
    {
      // @ts-expect-error `strike` tag is obsolete.
      children: <strike>S</strike>,
      onClick: exec('strikeThrough'),
      title: 'Strikethrough',
    },
    {
      children: <span>&para;</span>,
      onClick: exec('removeFormat'),
      title: 'Remove format',
    },
  ];

  render({ node, offsets, position }: Popup$Props) {
    const x = position.x + position.width / 2 - offsets.x + node.scrollLeft;
    const y = position.y + position.height - offsets.y + node.scrollTop;

    return (
      <div
        className="bg-white popup"
        style={{ transform: `translate(${x}px,${y}px)translate(-50%,.25em)` }}
      >
        {this.actions.map((props, index) => (
          <button
            className="bg-white bw0 dark-gray hover-bg-near-white pointer"
            key={index}
            {...props}
          />
        ))}
      </div>
    );
  }
}
