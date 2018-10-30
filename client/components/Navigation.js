// @flow
// @jsx h

import {h} from 'preact';

import {Logo} from '@client/components/Logo';
import {iconCog} from '@client/components/Icon';
import {iconLogIn} from '@client/components/Icon';
import {iconLogOut} from '@client/components/Icon';
import {iconNote} from '@client/components/Icon';
import {onLogout} from '@client/actions';

import type {UserType} from '@types';

type Navigation$Props = {|
  pend: number,
  user: ?UserType
|};

export const Navigation = (props: Navigation$Props) => (
  <div class="bg-dark-gray flex flex-around flex-center flex-column h-100 near-white pa3 ph1">
    <a
      class="flex flex-0 flex-center mb1 mt1 near-white"
      data-test-navigation="logo"
      href={props.user ? '/notes' : '/'}
      title="DocTeer"
    >
      <Logo class={`${props.pend ? '' : 'freeze '}h3 w3`} />
    </a>

    {!!props.user && (
      <a
        class="hover-bg-shade br-100 flex flex-0 flex-center mb1 mt1 square tc"
        data-test-navigation="notes"
        href="/notes"
        title="Notes"
      >
        <div class="h2 pa1 w2">{iconNote}</div>
      </a>
    )}

    {!!props.user && (
      <a
        class="hover-bg-shade br-100 flex flex-0 flex-center mb1 mt1 square tc"
        data-test-navigation="settings"
        href="/settings"
        title="Settings"
      >
        <div class="h2 pa1 w2">{iconCog}</div>
      </a>
    )}

    <div class="flex-1 flex-auto" />

    <a
      class="hover-bg-shade br-100 flex flex-0 flex-center mb1 mt1 square tc"
      data-test-navigation={props.user ? 'logout' : 'login'}
      href="/login"
      onClick={props.user && onLogout}
      title={`Log ${props.user ? 'Out' : 'In'}`}
    >
      <div class="h2 pa1 w2">{props.user ? iconLogOut : iconLogIn}</div>
    </a>
  </div>
);
