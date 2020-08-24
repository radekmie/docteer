import { method } from '..';
import { APIContextType, PatchType } from '../../../types';

type Params = { refresh: number };

export async function handle({ refresh }: Params, context: APIContextType) {
  const diff: PatchType = { created: [], removed: [], updated: [] };
  if (refresh === Infinity) {
    return diff;
  }

  const after = new Date(refresh);

  const { Notes, NotesArchive } = context.collections;
  await Notes.find(
    { _id_user: context.userId, _updated: { $gt: after } },
    {
      projection: { _id: 0, _id_user: 0, _updated: 0, _version: 0 } as object,
      session: context.session,
    },
  ).forEach(note => {
    if (note._removed && note._removed > after) {
      diff.removed.push(note._id_slug);
    } else {
      diff.updated.push({
        _id: note._id_slug,
        _outname: note._outname,
        _outline: note._outline,
        // @ts-expect-error `note._objects` is an array.
        ...note._objects,
      });

      if (note._created > after) {
        diff.created.push(note._id_slug);
      }
    }
  });

  await NotesArchive.find(
    { _id_user: context.userId, _updated: { $gt: after } },
    {
      projection: { _id: 0, _id_slug: 1 } as object,
      session: context.session,
    },
  ).forEach(note => {
    diff.removed.push(note._id_slug);
  });

  return diff;
}

export const schema = {
  type: 'object',
  properties: {
    refresh: { type: 'integer', minimum: 0 },
  },
  required: ['refresh'],
  additionalProperties: false,
};

export default method(handle, schema);
