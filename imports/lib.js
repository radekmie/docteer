// @flow

import type {SchemaOutlineFieldType} from './types.flow';
import type {SchemaType} from './types.flow';

export function cache<A, B>(fn: A => B): A => B {
  const cached: {[A]: B} = {};

  return (x: A): B => cached[x] || (cached[x] = fn(x));
}

export function schemaEmpty({fields, name}: SchemaType<*>) {
  return Object.keys(fields).reduce(
    (empty, key) =>
      Object.assign(empty, {[key]: schemaIsArray(fields[key]) ? [] : ''}),
    {_outline: fields, _outname: name}
  );
}

export function schemaIsArray(tag: SchemaOutlineFieldType): boolean {
  return tag === 'ol' || tag === 'ul';
}

export function schemaKey(name: string) {
  return (name[0].toUpperCase() + name.slice(1)).replace(
    /(.)([A-Z])/g,
    '$1 $2'
  );
}

const TITLES = {
  notes: 'Notes',
  login: 'Log in',
  signup: 'Sign in',
  settings: 'Settings'
};

export function titleForView(view: string) {
  return TITLES[view] || 'Copy anything. Paste it. Stay organized';
}
