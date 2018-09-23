// @flow
// @jsx h

import {Component} from 'preact';
import {h} from 'preact';

import {Button} from './Button';
import {iconLock} from './Icon';
import {iconUser} from './Icon';
import {onLogin} from '../actions';
import {onSignup} from '../actions';

type Account$Props = {|
  signup?: boolean
|};

export class Account extends Component<Account$Props> {
  email: ?HTMLInputElement;
  password: ?HTMLInputElement;
  password2: ?HTMLInputElement;

  onRefEmail = (ref: ?HTMLInputElement) => {
    this.email = ref;
  };

  onRefPassword = (ref: ?HTMLInputElement) => {
    this.password = ref;
  };

  onRefPassword2 = (ref: ?HTMLInputElement) => {
    this.password2 = ref;
  };

  onSubmit = (event: Event) => {
    event.preventDefault();

    if (this.email && this.password) {
      const action = this.props.signup ? onSignup : onLogin;
      action(this.email.value, this.password.value).catch(() => {});
    }
  };

  // $FlowFixMe
  render({signup}: Account$Props) {
    return (
      <form action="#" class="w5" onSubmit={this.onSubmit}>
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
            autocomplete={`${signup ? 'new' : 'current'}-password`}
            class="ba bg-near-white br-0 bw1 flex-1 ml1 ph1"
            id="password"
            minlength={4}
            name="password"
            placeholder="Password"
            ref={this.onRefPassword}
            required
            type="password"
          />
        </label>

        <Button
          class="h2 w-100"
          data-test-user={signup ? 'signup' : 'login'}
          title={signup ? 'Sign up' : 'Log in'}
          type="submit"
        >
          {signup ? 'Sign up' : 'Log in'}
        </Button>

        <hr class="ba mt3" />

        <span class="db tc">
          {`${signup ? 'Already a' : 'New'} member?`}
          <a class="ml1" href={`/${signup ? 'login' : 'signup'}`}>
            {signup ? 'Log in' : 'Sign up'}
          </a>
          .
        </span>
      </form>
    );
  }
}
