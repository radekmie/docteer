// @flow
// @jsx h

import {h} from 'preact';

import {Meteor} from 'meteor/meteor';

let sizer = null;

function blurs() {
  window.getSelection().removeAllRanges();
}

function clientX(event) {
  return (event.touches ? event.touches[0] : event).clientX;
}

function onSized(event) {
  if (sizer) {
    blurs();
    event.preventDefault();
    sizer.style.width = `${clientX(event) - sizer.offsetLeft}px`;
  }
}

function onStart(event) {
  blurs();
  event.preventDefault();
  sizer = event.currentTarget.parentNode.previousSibling;
  onSized(event);
}

function onStop() {
  blurs();
  sizer = null;
}

if (Meteor.isClient) {
  document.addEventListener('mouseup', onStop);
  // $FlowFixMe
  document.addEventListener('mousemove', onSized);
  // $FlowFixMe
  document.addEventListener('touchmove', onSized);
}

export const Resizer = () => (
  <div class="b--dark-gray bl br bw1 resizer">
    <div onMouseDown={onStart} onTouchEnd={onStop} onTouchStart={onStart} />
  </div>
);
