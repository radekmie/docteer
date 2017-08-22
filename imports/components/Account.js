/** @jsx h */

import {Component, h} from 'preact';

import {
    onLogin,
    onLogout
} from '/imports/state/actions';

export class Account extends Component {
    onRefEmail = ref => {
        this.email = ref;
    };

    onRefPassword = ref => {
        this.password = ref;
    };

    onSubmit = event => {
        event.preventDefault();

        if (this.email && this.password) {
            onLogin(this.email.value, this.password.value);
        }
    };

    render (props) {
        return (
            <form class={`b--dark-gray bt bw1 pa2${props.user ? ' pt1' : ''}`} onSubmit={this.onSubmit}>
                {!!props.user && (
                    <div class="mb1 tc w-100">
                        <b>{props.user.emails[0].address}</b>
                    </div>
                )}

                {!!props.user && (
                    <button class="w-100" onClick={onLogout} title="Log Out">
                        Log Out
                    </button>
                )}

                {!!props.user || (
                    <label class="flex mb1" htmlFor="email" title="Email">
                        <code><b>L</b></code>
                        <input class="bg-near-white bw0 flex-auto ml2 ph1" id="email" name="email" ref={this.onRefEmail} type="email" />
                    </label>
                )}

                {!!props.user || (
                    <label class="flex mb1" htmlFor="password" title="Password">
                        <code><b>P</b></code>
                        <input class="bg-near-white bw0 flex-auto ml2 ph1" id="password" name="password" ref={this.onRefPassword} type="password" />
                    </label>
                )}

                {!!props.user || (
                    <button class="w-100" title="Log In">
                        Log In
                    </button>
                )}
            </form>
        );
    }
}
