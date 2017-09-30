// @flow
// @jsx h

import {Component} from 'preact';
import {h}         from 'preact';

import {Button}   from './Button';
import {iconLock} from './Icon';
import {iconUser} from './Icon';
import {onLogin}  from '../lib/stateActions';

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
    return (
      <form class="w5" onSubmit={this.onSubmit}>
        <label class="flex h2 mb1" for="email" title="Email">
          {iconUser}
          <input class="ba bg-near-white br-0 bw1 flex-1 ml1 ph1" id="email" name="email" ref={this.onRefEmail} required type="email" />
        </label>

        <label class="flex h2 mb1" for="password" title="Password">
          {iconLock}
          <input class="ba bg-near-white br-0 bw1 flex-1 ml1 ph1" id="password" name="password" ref={this.onRefPassword} required type="password" />
        </label>

        <Button class="h2 w-100" title="Log In">
          Log In
        </Button>
      </form>
    );
  }
}
