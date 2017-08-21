import {Docs} from '..';

Docs._ensureIndex({_id_user: 1, _id_slug: 1}, {unique: true});
Docs._ensureIndex({_id_user: 1, _removed: 1});
