// @flow
// @jsx h

import {h} from 'preact';

type Button$Props = {
  as: string,
  class?: string,
  tabIndex?: any
};

export function Button({as, ...props}: Button$Props) {
  return h(
    as,
    Object.assign(props, {
      class: [
        `b--dark-gray ba bg-${
          props.disabled ? 'near-' : ''
        }white bw1 dark-gray db${
          props.disabled ? '' : ' dim pointer'
        } tc trans`,
        props.class
      ]
        .filter(Boolean)
        .join(' '),
      tabIndex: '0'
    })
  );
}

Button.defaultProps = {
  as: 'button'
};
