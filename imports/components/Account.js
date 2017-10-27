// @flow
// @jsx h

import {Component} from 'preact';
import {h} from 'preact';

import {Button} from './Button';
import {iconLock} from './Icon';
import {iconUser} from './Icon';
import {onLogin} from '../actions';
import {onRegister} from '../actions';

type Account$Props = {
  register: ?boolean
};

export class Account extends Component<Account$Props> {
  email: ?HTMLInputElement;
  password: ?HTMLInputElement;
  password2: ?HTMLInputElement;

  onRefEmail = (ref: ?HTMLInputElement) => {
    this.email = ref;
  };

  onRefpassword = (ref: ?HTMLInputElement) => {
    this.password = ref;
  };

  onRefPassword2 = (ref: ?HTMLInputElement) => {
    this.password2 = ref;
  };

  onSubmit = (event: Event) => {
    event.preventDefault();

    if (this.email && this.password) {
      if (this.props.register)
        onRegister(this.email.value, this.password.value);
      else onLogin(this.email.value, this.password.value);
    }
  };

  render({register}: Account$Props) {
    return (
      <form class="w5" onSubmit={this.onSubmit}>
        <label class="flex h2 mb1" for="email" title="Email">
          {iconUser}
          <input
            autocomplete="email username"
            class="ba bg-near-white br-0 bw1 flex-1 ml1 ph1"
            id="email"
            name="email"
            placeholder="Email"
            ref={this.onRefEmail}
            required
            type="email"
          />
        </label>

        <label class="flex h2 mb1" for="password" title="Password">
          {iconLock}
          <input
            autocomplete={`${register ? 'new' : 'current'}-password`}
            class="ba bg-near-white br-0 bw1 flex-1 ml1 ph1"
            id="password"
            minlength={5}
            name="password"
            placeholder="Password"
            ref={this.onRefpassword}
            required
            type="password"
          />
        </label>

        <Button class="h2 w-100" title={`${register ? 'Sign' : 'Log'} In`}>
          {`${register ? 'Sign' : 'Log'} In`}
        </Button>

        <span class="db mt1 tc">
          {`${register ? 'Already a' : 'New'} member?`}
          <a class="ml1" href={`/${register ? 'l' : 'r'}`}>
            {`${register ? 'Log' : 'Sign'} In`}
          </a>
          .
        </span>
      </form>
    );
  }
}
