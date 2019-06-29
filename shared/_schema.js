// @flow

import type {SchemaOutlineFieldType, SchemaType} from '@types';

export function schemaEmpty({fields, name}: SchemaType<>) {
  return fields.reduce(
    (empty, {name, type}) =>
      Object.assign(empty, {[name]: schemaIsArray(type) ? [] : ''}),
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
