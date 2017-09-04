// @flow
// @jsx h

import {h} from 'preact';

import {Logo} from './Logo';

import type {TUser} from '/imports/types.flow';

type Header$Props = {
  pend: number,
  user: ?TUser
};

export function Header (props: Header$Props) {
  return (
    <div class="b--dark-gray bb bw1">
      <a class="dark-gray flex link pt1" href={`/${props.user ? 'd' : ''}`}>
        <Logo class={`${props.pend ? '' : 'freeze '}h3 w3`} />

        <h1 class="f4">
          DocTeer
        </h1>
      </a>
    </div>
  );
}
