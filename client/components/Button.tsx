import { JSX, h } from 'preact';

type Button$Props = JSX.HTMLAttributes<HTMLButtonElement>;

export function Button(props: Button$Props) {
  const className = [
    `b--dark-gray ba bg-${props.disabled ? 'near-' : ''}white bw1 dark-gray db${
      props.disabled ? '' : ' dim pointer'
    } tc trans`,
    props.className,
  ]
    .filter(Boolean)
    .join(' ');

  return <button {...props} className={className} tabIndex={0} />;
}
