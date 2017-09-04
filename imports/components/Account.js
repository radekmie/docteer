// @flow
// @jsx h

import {Component} from 'preact';
import {h}         from 'preact';

import {Button}   from '/imports/components/Button';
import {iconLock} from '/imports/components/Icon';
import {iconUser} from '/imports/components/Icon';
import {onLogin}  from '/imports/lib/stateActions';
import {onLogout} from '/imports/lib/stateActions';

import type {TUser} from '/imports/types.flow';

type Account$Props = {
  user: ?TUser
};

export class Account extends Component<Account$Props> {
  email:    ?HTMLInputElement;
  password: ?HTMLInputElement;

  onRefEmail = (ref: ?HTMLInputElement) => {
    this.email = ref;
  };

  onRefPassword = (ref: ?HTMLInputElement) => {
    this.password = ref;
  };

  onSubmit = (event: Event) => {
    event.preventDefault();

    if (this.email && this.password)
      onLogin(this.email.value, this.password.value);
  };

  render () {
    const props = this.props;

    return (
      <form class={`b--dark-gray bt bw1 pa2${props.user ? ' pt1' : ''}`} onSubmit={this.onSubmit}>
        {!!props.user && (
          <div class="mb1 tc">
            <b>{props.user.emails[0].address}</b>
          </div>
        )}

        {!!props.user && (
          <Button as="a" class="mb1 link w-100" href={`/${props.view === 's' ? 'd' : 's'}`} title="Settings">
            Settings
          </Button>
        )}

        {!!props.user && (
          <Button class="w-100" onClick={onLogout} title="Log Out">
            Log Out
          </Button>
        )}

        {!!props.user || (
          <label class="flex mb1" for="email" title="Email">
            {iconUser}
            <input class="ba bg-near-white bw1 flex-1 ml1 ph1" id="email" name="email" ref={this.onRefEmail} type="email" />
          </label>
        )}

        {!!props.user || (
          <label class="flex mb1" for="password" title="Password">
            {iconLock}
            <input class="ba bg-near-white bw1 flex-1 ml1 ph1" id="password" name="password" ref={this.onRefPassword} type="password" />
          </label>
        )}

        {!!props.user || (
          <Button class="w-100" title="Log In">
            Log In
          </Button>
        )}
      </form>
    );
  }
}
