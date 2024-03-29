import { h } from 'preact';

import { ToastType } from '../../types';

const COLOR = {
  error: 'red',
  info: 'blue',
  success: 'green',
};

type Toasts$Props = {
  toasts: ToastType[];
};

export function Toasts(props: Toasts$Props) {
  if (props.toasts.length === 0) {
    return null;
  }

  return (
    <div
      className="bottom-1 center-h fixed w5"
      data-test-toasts={props.toasts.filter(toast => !toast.dead).length <= 3}
    >
      {props.toasts.map(toast => (
        <div
          className={`bl bg-near-white bw2 b--dark-${
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
