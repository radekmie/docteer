// @flow

import sha from 'js-sha256';

import type {SchemaOutlineFieldType} from '../types.flow';
import type {SchemaType} from '../types.flow';

export function cache<A, B>(fn: A => B): A => B {
  const cached: {[A]: B} = {};

  return (x: A): B => cached[x] || (cached[x] = fn(x));
}

export function hash(text: string) {
  return {algorithm: 'sha-256', digest: sha.sha256(text)};
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

const options = {
  numeric: true,
  sensitivity: 'base'
};

let collator: {compare(a: string, b: string): number};
try {
  collator = new window.Intl.Collator(undefined, options);
} catch (error) {
  collator = {compare: (a, b) => a.localeCompare(b, undefined, options)};
}

export const compare = collator.compare.bind(collator);
export const compareDocs = (
  a: {_id: string, name: string},
  b: {_id: string, name: string}
) => compare(a.name, b.name) || compare(a._id, b._id);

const TITLES = {
  notes: 'Notes',
  login: 'Log in',
  signup: 'Sign in',
  settings: 'Settings'
};

export function titleForView(view: string) {
  return TITLES[view] || 'Copy anything. Paste it. Stay organized';
}
