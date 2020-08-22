import { h } from 'preact';

import { UserType } from '../../types';
import { onLogout } from '../actions';
import { iconCog, iconLogIn, iconLogOut, iconNote } from './Icon';
import { Logo } from './Logo';

type Navigation$Props = {
  pend: number;
  user: UserType | null | undefined;
};

export const Navigation = (props: Navigation$Props) => (
  <div className="bg-dark-gray flex flex-around flex-center flex-column h-100 near-white pa3 ph1">
    <a
      className="flex flex-0 flex-center mb1 mt1 near-white"
      data-test-navigation="logo"
      href={props.user ? '/notes' : '/'}
      title="DocTeer"
    >
      <Logo className={`${props.pend ? '' : 'freeze '}h3 w3`} />
    </a>

    {!!props.user && (
      <a
        className="hover-bg-shade br-100 flex flex-0 flex-center mb1 mt1 square tc"
        data-test-navigation="notes"
        href="/notes"
        title="Notes"
      >
        <div className="h2 pa1 w2">{iconNote}</div>
      </a>
    )}

    {!!props.user && (
      <a
        className="hover-bg-shade br-100 flex flex-0 flex-center mb1 mt1 square tc"
        data-test-navigation="settings"
        href="/settings"
        title="Settings"
      >
        <div className="h2 pa1 w2">{iconCog}</div>
      </a>
    )}
    <div className="flex-1 flex-auto" />
    <a
      className="hover-bg-shade br-100 flex flex-0 flex-center mb1 mt1 square tc"
      data-test-navigation={props.user ? 'logout' : 'login'}
      href="/login"
      // @ts-expect-error Use undefined instead of null.
      onClick={props.user && onLogout}
      title={`Log ${props.user ? 'Out' : 'In'}`}
    >
      <div className="h2 pa1 w2">{props.user ? iconLogOut : iconLogIn}</div>
    </a>
  </div>
);
