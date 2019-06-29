// @flow

import {method} from '@server/services';

import type {APIContextType} from '@types';
import type {PatchType} from '@types';

type Params = {|refresh: number|};

export async function handle({refresh}: Params, context: APIContextType) {
  const diff: PatchType<> = {created: [], removed: [], updated: []};
  if (refresh === Infinity) return diff;

  const after = new Date(refresh);
  const projection = {
    _id: 0,
    _id_user: 0,
    _updated: 0,
    _version: 0
  };

  const {Notes} = context.collections;
  await Notes.find(
    {_id_user: context.userId, ...(after ? {_updated: {$gt: after}} : {})},
    {projection, session: context.session}
  ).forEach(note => {
    if (note._removed && note._removed > after) {
      diff.removed.push(note._id_slug);
    } else {
      diff.updated.push({
        _id: note._id_slug,
        _outname: note._outname,
        _outline: note._outline,
        ...note._objects
      });

      if (note._created > after) diff.created.push(note._id_slug);
    }
  });

  return diff;
}

export const schema = {
  type: 'object',
  properties: {
    refresh: {type: 'integer', minimum: 0}
  },
  required: ['refresh'],
  additionalProperties: false
};

export default method<Params, _, _>(handle, schema);
