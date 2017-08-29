import {Notes} from '..';

Notes._ensureIndex({_id_user: 1, _id_slug: 1}, {unique: true});
Notes._ensureIndex({_id_user: 1, _updated: 1});
