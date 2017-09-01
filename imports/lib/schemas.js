// @flow

export function schemaEmpty (schema: {[string]: string}) {
  return Object.keys(schema).reduce((empty, key) => Object.assign(empty, {[key]: schemaIsArray(schema[key]) ? [] : ''}), {});
}

export function schemaIsArray (tag: string) {
  return tag === 'ol' || tag === 'ul';
}

export function schemaKey (name: string) {
  return (name[0].toUpperCase() + name.slice(1)).replace(/(.)([A-Z])/g, '$1 $2');
}
