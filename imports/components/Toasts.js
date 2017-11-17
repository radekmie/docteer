// @flow
// @jsx h

import {h} from 'preact';

const COLOR = {
  error: 'red',
  info: 'blue',
  success: 'green'
};

type TToast = {
  _id: number,
  dead: boolean,
  type: 'info' | 'error' | 'success',
  text: string
};

type Toasts$Props = {
  toasts: TToast[]
};

export function Toasts(props: Toasts$Props) {
  return (
    <div
      class="bottom-1 center-h fixed w5"
      data-test-toasts={props.toasts.filter(toast => !toast.dead).length <= 3}
    >
      {props.toasts.map(toast => (
        <div
          class={`bl bg-near-white bw2 b--dark-${
            COLOR[toast.type]
          } mt1 pa1 ph2 shadow-4 trans${toast.dead ? ' transparent' : ''}`}
          data-test-toast={toast.text}
          key={toast._id}
        >
          {toast.text}
        </div>
      ))}
    </div>
  );
}
