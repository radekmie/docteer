// @flow

import {method} from '@server/services';

import type {APIContextType} from '@types';

type Params = {||};

export async function handle(input: Params, context: APIContextType) {
  const {Notes, NotesArchive} = context.collections;
  const archive = await Notes.find(
    {_removed: {$ne: null}},
    {session: context.session}
  ).toArray();

  if (archive.length === 0) return;

  const $in = archive.map(note => note._id);

  await Promise.all([
    Notes.deleteMany({_id: {$in}}, {session: context.session}),
    NotesArchive.insertMany(archive, {session: context.session})
  ]);
}

export const schema = {
  type: 'object',
  properties: {},
  required: [],
  additionalProperties: false
};

export default method<Params, _, _>(handle, schema);
