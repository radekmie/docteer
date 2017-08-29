/** @jsx h */

import {h} from 'preact';

const COLOR = {error: 'red', info: 'blue', success: 'green'};

export function Toasts (props) {
  return (
    <div class="bottom-1 center-h fixed hide-child">
      {props.toasts.map(toast =>
        <div class={`bl bg-near-white bw2 b--dark-${COLOR[toast.type]}${toast.dead ? ' child' : ''} mt1 pa1 ph2 shadow-4 tj w5`} key={toast._id}>
          {toast.text}
        </div>
      )}
    </div>
  );
}
