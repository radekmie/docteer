// @flow

import {Meteor} from 'meteor/meteor';

import {Notes} from '..';

Meteor.startup(() => {
  Notes._ensureIndex({_id_user: 1, _id_slug: 1}, {unique: true});
  Notes._ensureIndex({_id_user: 1, _updated: 1});
  Notes._ensureIndex({_removed: 1});
});
