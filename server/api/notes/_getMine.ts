import { APIContextType, PatchType } from '../../../types';
import { method } from '../../lib';

type Params = { refresh: number };

async function handle({ refresh }: Params, context: APIContextType) {
  const result = {
    patch: { created: [], removed: [], updated: [] } as PatchType,
    refresh: +context.now,
  };

  // There's no newer data.
  if (refresh >= result.refresh) {
    return result;
  }

  const after = new Date(refresh);
  const { Notes } = context.collections;
  await Notes.find(
    {
      _id_user: context.userId,
      _removed: refresh === 0 ? null : undefined,
      _updated: { $gt: after },
    },
    {
      projection: {
        _created: 1,
        _id: 0,
        _id_slug: 1,
        _objects: 1,
        _outline: 1,
        _outname: 1,
        _removed: 1,
      } as object,
      session: context.session,
    },
  ).forEach(note => {
    if (note._removed && note._removed > after) {
      result.patch.removed.push(note._id_slug);
      return;
    }

    if (note._created > after) {
      result.patch.created.push(note._id_slug);
    }

    result.patch.updated.push({
      _id: note._id_slug,
      _outname: note._outname,
      _outline: note._outline,
      ...note._objects,
    });
  });

  return result;
}

const schema = {
  type: 'object',
  properties: {
    refresh: { type: 'integer', minimum: 0 },
  },
  required: ['refresh'],
  additionalProperties: false,
};

export const getMine = method(handle, schema);
