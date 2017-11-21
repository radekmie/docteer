// @flow

export function schemaEmpty({
  fields,
  name
}: {
  fields: {[string]: string},
  name: string
}) {
  return Object.keys(fields).reduce(
    (empty, key) =>
      Object.assign(empty, {[key]: schemaIsArray(fields[key]) ? [] : ''}),
    {_outline: fields, _outname: name}
  );
}

export function schemaIsArray(tag: string) {
  return tag === 'ol' || tag === 'ul';
}

export function schemaKey(name: string) {
  return (name[0].toUpperCase() + name.slice(1)).replace(
    /(.)([A-Z])/g,
    '$1 $2'
  );
}

export function titleForView(view: string) {
  if (view === 'd') return 'Notes';
  if (view === 'l') return 'Log in';
  if (view === 'r') return 'Sign in';
  if (view === 's') return 'Settings';
  return 'Copy anything. Paste it. Stay organized';
}
