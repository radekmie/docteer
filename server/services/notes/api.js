// @flow

import {endpoint} from '../../lib/api';
import * as notes from './lib';

import type {PatchType} from '../../../imports/types.flow';

endpoint('GET /api/notes', {
  schema: {
    refresh: {
      type: Number,
      optional: true,
      min: 0
    }
  },

  async handle({refresh}: {|refresh: number|}): PatchType<*, *, *> {
    return notes.byUser(this.userId, refresh);
  }
});

endpoint('POST /api/notes', {
  schema: {
    patch: Object,
    'patch.created': Array,
    'patch.created.$': String,
    'patch.removed': Array,
    'patch.removed.$': String,
    'patch.updated': Array,
    'patch.updated.$': {type: Object, blackbox: true},
    'patch.updated.$._id': String,
    'patch.updated.$._outline': {type: Object, optional: true, blackbox: true},
    'patch.updated.$._outname': {type: String, optional: true},
    refresh: {
      type: Number,
      optional: true,
      min: 0
    }
  },

  async handle({
    patch,
    refresh
  }: {|
    patch: PatchType<*, *, *>,
    refresh: number
  |}): Promise<PatchType<*, *, *>> {
    await notes.patch(patch, this.userId);
    const result = notes.byUser(this.userId, refresh);

    if (patch.removed.length) await notes.archive();

    return result;
  }
});
