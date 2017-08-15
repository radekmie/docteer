import {Proofs} from '..';

Proofs._ensureIndex({_user_id: 1, _id_slug: 1}, {unique: true});
Proofs._ensureIndex({_user_id: 1, _removed: 1});
