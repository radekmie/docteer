// @flow
// @jsx h

import {h, render} from 'preact';

import {Popup} from '@client/components/Popup';

function create(node) {
  if (!node.popup) {
    node.popup = document.createElement('div');
    node.parentElement.appendChild(node.popup);

    document.addEventListener('click', function hide(event: MouseEvent) {
      // $FlowFixMe: Lift EventTarget to HTMLElement.
      let element: HTMLElement = event.target;
      do {
        if (element === node) return;
      } while ((element = element.parentElement));

      document.removeEventListener('click', hide);

      remove(node);
    });
  }

  return node.popup;
}

function remove(node) {
  if (node && node.popup) {
    rerender(null, node.popup);
    node.parentElement.removeChild(node.popup);
    node.popup = null;
  }
}

function rerender(jsx, node) {
  render(jsx, node, node.firstChild);
}

document.addEventListener('selectionchange', () => {
  const selection = window.getSelection();
  if (!selection || !selection.rangeCount) return;

  let element = selection.anchorNode;
  do {
    if (element.contentEditable === 'true') break;
  } while ((element = element.parentElement));

  const range = selection.getRangeAt(0);
  if (!range || range.startOffset === range.endOffset) {
    remove(element);
    return;
  }

  if (element) {
    const node = element.parentElement.parentElement;

    rerender(
      <Popup
        node={node}
        offsets={node.getBoundingClientRect()}
        position={range.getBoundingClientRect()}
      />,
      create(element)
    );
  }
});
