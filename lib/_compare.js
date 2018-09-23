// @flow

const options = {numeric: true, sensitivity: 'base'};

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
