/** @jsx h */

import {Component, h} from 'preact';

export class Toasts extends Component {
    render (props) {
        return (
            <div class="bottom-1 center-h fixed hide-child">
                {props.toasts.map(toast =>
                    <div class={`bl bg-near-white bw2 b--dark-${color(toast.type)}${toast.dead ? ' child' : ''} mt1 pa1 ph2 shadow-4 tj w5`} key={toast._id}>
                        {toast.text}
                    </div>
                )}
            </div>
        );
    }
}

function color (type) {
    return {error: 'red', info: 'blue', success: 'green'}[type];
}
