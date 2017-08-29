export function schemaEmpty (schema) {
  return Object.assign(...Object.keys(schema).map(key => ({[key]: schemaIsArray(schema[key]) ? [] : ''})));
}

export function schemaIsArray (tag) {
  return tag === 'ol' || tag === 'ul';
}

export function schemaKey (name) {
  return (name[0].toUpperCase() + name.slice(1)).replace(/(.)([A-Z])/g, '$1 $2');
}
