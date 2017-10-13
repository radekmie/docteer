// @flow
// @jsx h

import {h} from 'preact';

type Help$Props = {
  active: boolean
};

const actions = [
  ['?', 'Show help'],
  ['↑', 'Previous note'],
  ['↓', 'Next note'],
  ['←', 'Previous filter'],
  ['→', 'Next filter'],
  ['Enter', 'Toggle note/filter']
].map(action => (
  <div class="flex flex-between" key={action[0]}>
    <b>
      <code>{action[0]}</code>
    </b>
    <i>{action[1]}</i>
  </div>
));

export function Help(props: Help$Props) {
  return (
    <div
      class={`bg-dark-gray center fixed${props.active
        ? ''
        : ' hidden'} near-white pa3 w5`}
    >
      <div class="flex flex-between flex-end">
        <b>Keyboard Shortcuts</b>
        <small>ESC to close</small>
      </div>
      <hr />
      {actions}
    </div>
  );
}