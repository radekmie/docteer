// @flow

import {Match}  from 'meteor/check';
import {Meteor} from 'meteor/meteor';
import {check}  from 'meteor/check';

Meteor.methods({
  'users.settings' (settings) {
    try {
      check(this.userId, String);
      check(settings, {schemas: [Object]});
      check(settings.schemas, Match.Where(schemas => {
        schemas.forEach(schema => {
          check(schema, {name: String, fields: Object});
          Object.keys(schema.fields).forEach(key => {
            check(schema.fields[key], Match.OneOf('div', 'ol', 'ul'));
          });
        });

        return true;
      }));
    } catch (error) {
      return;
    }

    Meteor.users.update({_id: this.userId}, {$set: settings});
  }
});
