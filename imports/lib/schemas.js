export const schema = {
    name:   'div',
    labels: 'ul',
    target: 'div',
    expect: 'div',
    steps:  'ol'
};

export function schemaEmpty (schema) {
    return Object.assign.apply(
        Object,
        Object.keys(schema).map(key => ({[key]: schemaIsArray(schema[key]) ? [] : ''}))
    );
}

export function schemaIsArray (tag) {
    return tag === 'ol' || tag === 'ul';
}
