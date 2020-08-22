import { Component, h } from 'preact';

import { onLogin, onSignup } from '../actions';
import { Button } from './Button';
import { iconLock, iconUser } from './Icon';

type Account$Props = {
  signup?: boolean;
};

export class Account extends Component<Account$Props> {
  email: HTMLInputElement | null | undefined;
  password: HTMLInputElement | null | undefined;
  password2: HTMLInputElement | null | undefined;

  onRefEmail = (ref: HTMLInputElement | null | undefined) => {
    this.email = ref;
  };

  onRefPassword = (ref: HTMLInputElement | null | undefined) => {
    this.password = ref;
  };

  onRefPassword2 = (ref: HTMLInputElement | null | undefined) => {
    this.password2 = ref;
  };

  onSubmit = (event: Event) => {
    event.preventDefault();

    if (this.email && this.password) {
      const action = this.props.signup ? onSignup : onLogin;
      action(this.email.value, this.password.value).catch(() => {});
    }
  };

  render({ signup }: Account$Props) {
    return (
      <form action="#" className="w5" onSubmit={this.onSubmit}>
        <label className="flex h2 mb1" htmlFor="email" title="Email">
          {iconUser}
          <input
            autoComplete="email username"
            className="ba bg-near-white br-0 bw1 flex-1 ml1 ph1 w-100"
            id="email"
            name="email"
            placeholder="Email"
            ref={this.onRefEmail}
            required
            type="email"
          />
        </label>
        <label className="flex h2 mb1" htmlFor="password" title="Password">
          {iconLock}
          <input
            autoComplete={`${signup ? 'new' : 'current'}-password`}
            className="ba bg-near-white br-0 bw1 flex-1 ml1 ph1 w-100"
            id="password"
            minLength={4}
            name="password"
            placeholder="Password"
            ref={this.onRefPassword}
            required
            type="password"
          />
        </label>
        <Button
          className="h2 w-100"
          data-test-user={signup ? 'signup' : 'login'}
          title={signup ? 'Sign up' : 'Log in'}
          type="submit"
        >
          {signup ? 'Sign up' : 'Log in'}
        </Button>
        <hr className="ba mt3" />
        <span className="db tc">
          {`${signup ? 'Already a' : 'New'} member?`}
          <a className="ml1" href={`/${signup ? 'login' : 'signup'}`}>
            {signup ? 'Log in' : 'Sign up'}
          </a>
          .
        </span>
      </form>
    );
  }
}
