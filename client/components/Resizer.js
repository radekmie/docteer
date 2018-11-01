// @flow
// @jsx h

import {h} from 'preact';

let mover: ?HTMLElement = null;
let sizer: ?HTMLElement = null;

function blurs() {
  window.getSelection().removeAllRanges();
}

function clientX(event) {
  return (event instanceof TouchEvent ? event.touches[0] : event).clientX;
}

function onMoved(ref) {
  mover = ref;
}

function onSized(event: MouseEvent | TouchEvent) {
  if (sizer) {
    blurs();
    sizer.style.width = `${clientX(event) - sizer.offsetLeft}px`;
  }
}

function onStart(event: MouseEvent | TouchEvent) {
  // $FlowFixMe: EventTarget has no parentNode.
  if (mover && (event.target === mover || event.target.parentNode === mover)) {
    blurs();
    if (mover.previousSibling instanceof HTMLElement)
      sizer = mover.previousSibling;
    onSized(event);
  }
}

function onStop() {
  if (sizer) {
    blurs();
    sizer = null;
  }
}

if (typeof window !== 'undefined') {
  let modifier = false;
  window.addEventListener('', null, {
    // $FlowFixMe: unsafe-getters-setters
    get passive() {
      modifier = {passive: true};
      return false;
    }
  });

  document.addEventListener('mousedown', onStart, modifier);
  document.addEventListener('mousemove', onSized, modifier);
  document.addEventListener('mouseup', onStop, modifier);
  document.addEventListener('touchend', onStop, modifier);
  document.addEventListener('touchmove', onSized, modifier);
  document.addEventListener('touchstart', onStart, modifier);
}

export const Resizer = () => (
  <div class="b--dark-gray bl br bw1 resizer" ref={onMoved} />
);
