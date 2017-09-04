// @flow
// @jsx h

import {h} from 'preact';

type Button$Props = {
  as: string,
  class?: string
};

export function Button ({as, class: className, ...props}: Button$Props) {
  return h(as, Object.assign(props, {
    class: [`b--dark-gray ba bg-${props.disabled ? 'near-' : ''}white bw1 dark-gray db${props.disabled ? '' : ' dim pointer'} tc`, className].filter(Boolean).join(' '),
    tabIndex: '0'
  }));
}

Button.defaultProps = {
  as: 'button'
};
