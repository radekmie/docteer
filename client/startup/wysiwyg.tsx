import { VNode, h, render } from 'preact';

import { Popup } from '../components/Popup';

function create(node: HTMLElement) {
  if (!node.popup) {
    node.popup = document.createElement('div');
    node.parentElement!.appendChild(node.popup);

    document.addEventListener('click', function hide(event: MouseEvent) {
      let element = event.target as HTMLElement | null | undefined;
      do {
        if (element === node) {
          return;
        }
      } while ((element = element!.parentElement));

      document.removeEventListener('click', hide);

      remove(node);
    });
  }

  return node.popup;
}

function remove(node: HTMLElement) {
  if (node && node.popup) {
    rerender(null, node.popup);
    node.parentElement!.removeChild(node.popup);
    node.popup = null;
  }
}

function rerender(jsx: VNode | null, node: HTMLElement) {
  render(jsx, node, node.firstChild as HTMLElement);
}

document.addEventListener('selectionchange', () => {
  const selection = window.getSelection();
  if (!selection || !selection.rangeCount) {
    return;
  }

  let element = selection.anchorNode as HTMLElement;
  do {
    if (element.contentEditable === 'true') {
      break;
    }
  } while ((element = element.parentElement!));

  const range = selection.getRangeAt(0);
  if (!range || range.startOffset === range.endOffset) {
    remove(element);
    return;
  }

  if (element) {
    const node = element.parentElement!.parentElement!;

    rerender(
      <Popup
        node={node}
        offsets={node.getBoundingClientRect()}
        position={range.getBoundingClientRect()}
      />,
      create(element),
    );
  }
});
