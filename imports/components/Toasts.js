// @flow
// @jsx h

import {h} from 'preact';

const COLOR = {
  error: 'red',
  info: 'blue',
  success: 'green'
};

class TToast {
  _id: number;
  type: 'info' | 'error' | 'success';
  text: string;
}

type Toasts$Props = {
  toasts: TToast[]
};

export function Toasts(props: Toasts$Props) {
  return (
    <div class="bottom-1 center-h fixed hide-child w5">
      {props.toasts.map(toast => (
        <div
          class={`bl bg-near-white bw2 b--dark-${COLOR[toast.type]}${toast.dead
            ? ' child'
            : ''} mt1 pa1 ph2 shadow-4 tj`}
          key={toast._id}
        >
          {toast.text}
        </div>
      ))}
    </div>
  );
}
