// @flow
// @jsx h

import {h} from 'preact';

let mover = null;
let sizer = null;

function blurs() {
  window.getSelection().removeAllRanges();
}

function clientX(event) {
  return (event.touches ? event.touches[0] : event).clientX;
}

function onMoved(ref) {
  mover = ref;
}

function onSized(event) {
  if (sizer) {
    blurs();
    sizer.style.width = `${clientX(event) - sizer.offsetLeft}px`;
  }
}

function onStart(event) {
  if (!mover || (event.target !== mover && event.target.parentNode !== mover))
    return;

  blurs();
  sizer = mover.previousSibling;
  onSized(event);
}

function onStop() {
  if (sizer) {
    blurs();
    sizer = null;
  }
}

if (typeof window !== 'undefined') {
  let modifier = false;
  try {
    window.addEventListener(
      '',
      null,
      Object.defineProperty({}, 'passive', {
        value: undefined,
        get() {
          modifier = {passive: true};
          return undefined;
        }
      })
    );
  } catch (error) {
    // Empty.
  }

  // $FlowFixMe
  document.addEventListener('mousedown', onStart, modifier);
  // $FlowFixMe
  document.addEventListener('mousemove', onSized, modifier);
  document.addEventListener('mouseup', onStop, modifier);
  document.addEventListener('touchend', onStop, modifier);
  // $FlowFixMe
  document.addEventListener('touchmove', onSized, modifier);
  // $FlowFixMe
  document.addEventListener('touchstart', onStart, modifier);
}

export const Resizer = () => (
  <div class="b--dark-gray bl br bw1 resizer" ref={onMoved} />
);
