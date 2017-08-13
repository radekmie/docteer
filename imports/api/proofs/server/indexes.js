import {Proofs} from '..';

Proofs._ensureIndex({userId: 1});
Proofs._ensureIndex({userId: 1, _ud: 1}, {unique: true});
