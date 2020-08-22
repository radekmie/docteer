import { h } from 'preact';

let mover: HTMLElement | null | undefined = null;
let sizer: HTMLElement | null | undefined = null;

function blurs() {
  window.getSelection()!.removeAllRanges();
}

function clientX(event: MouseEvent | TouchEvent) {
  return (event instanceof TouchEvent ? event.touches[0] : event).clientX;
}

function onMoved(ref: typeof mover) {
  mover = ref;
}

function onSized(event: MouseEvent | TouchEvent) {
  if (sizer) {
    blurs();
    sizer.style.width = `${clientX(event) - sizer.offsetLeft}px`;
  }
}

function onStart(event: MouseEvent | TouchEvent) {
  if (mover && (event.target === mover || event.target!.parentNode === mover)) {
    blurs();
    if (mover.previousSibling instanceof HTMLElement) {
      sizer = mover.previousSibling;
    }
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
  let modifier: false | { passive: true } = false;
  // @ts-expect-error Invalid event name.
  window.addEventListener('', null, {
    get passive() {
      modifier = { passive: true };
      return false;
    },
  });

  document.addEventListener('mousedown', onStart, modifier);
  document.addEventListener('mousemove', onSized, modifier);
  document.addEventListener('mouseup', onStop, modifier);
  document.addEventListener('touchend', onStop, modifier);
  document.addEventListener('touchmove', onSized, modifier);
  document.addEventListener('touchstart', onStart, modifier);
}

export const Resizer = () => (
  <div className="b--dark-gray bl br bw1 resizer" ref={onMoved} />
);
