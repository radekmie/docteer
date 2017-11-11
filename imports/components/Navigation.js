// @flow
// @jsx h

import {h} from 'preact';

import {Logo} from './Logo';
import {iconCog} from './Icon';
import {iconLogIn} from './Icon';
import {iconLogOut} from './Icon';
import {iconNote} from './Icon';
import {onLogout} from '../actions';

class TUser {
  _changed: boolean;
  emails: {address: string, verified: boolean}[];
  schemas: {name: string, fields: {[string]: 'div' | 'ol' | 'ul'}}[];
}

type Navigation$Props = {
  full: boolean,
  pend: number,
  user: ?TUser
};

export const Navigation = (props: Navigation$Props) => (
  <div class="bg-dark-gray flex flex-around flex-center flex-column h-100 near-white pa3 ph1">
    <a
      class="flex flex-0 flex-center mb1 mt1 near-white"
      href="/"
      title="DocTeer"
    >
      <Logo class={`${props.pend ? '' : 'freeze '}h3 w3`} />
    </a>

    {!!props.user && (
      <a
        class="hover-bg-shade br-100 flex flex-0 flex-center mb1 mt1 square tc"
        href="/d"
        title="Notes"
      >
        <div class="h2 pa1 w2">{iconNote}</div>
      </a>
    )}

    {!!props.user && (
      <a
        class="hover-bg-shade br-100 flex flex-0 flex-center mb1 mt1 square tc"
        href="/s"
        title="Settings"
      >
        <div class="h2 pa1 w2">{iconCog}</div>
      </a>
    )}

    <div class="flex-1 flex-auto" />

    <a
      class="hover-bg-shade br-100 flex flex-0 flex-center mb1 mt1 square tc"
      href="/l"
      onClick={props.user && onLogout}
      title={props.user ? 'Log Out' : 'Log In'}
    >
      <div class="h2 pa1 w2">{props.user ? iconLogOut : iconLogIn}</div>
    </a>
  </div>
);
