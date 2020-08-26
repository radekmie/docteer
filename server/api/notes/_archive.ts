import { APIContextType } from '../../../types';
import { method } from '../../lib';

type Params = {};

async function handle(input: Params, context: APIContextType) {
  const { Notes, NotesArchive } = context.collections;
  const archive = await Notes.find(
    { _removed: { $ne: null } },
    { session: context.session },
  ).toArray();

  if (archive.length === 0) {
    return;
  }

  const $in = archive.map(note => note._id);

  await Promise.all([
    Notes.deleteMany({ _id: { $in } }, { session: context.session }),
    NotesArchive.insertMany(archive, { session: context.session }),
  ]);
}

const schema = {
  type: 'object',
  properties: {},
  required: [],
  additionalProperties: false,
};

export const archive = method(handle, schema);
