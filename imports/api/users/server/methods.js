// @flow

import {Match}  from 'meteor/check';
import {Accounts} from 'meteor/accounts-base';
import {Meteor}   from 'meteor/meteor';
import {check}    from 'meteor/check';

Meteor.methods({
  'users.password' (old, new1, new2) {
    try {
      check(this.userId, String);
      check(old, String);
      check(new1, String);
      check(new2, String);
    } catch (error) {
      throw new Meteor.Error('validation-error', 'Validation error.');
    }

    if (new1 !== new2)
      throw new Meteor.Error('password-mismatch', 'Passwords mismatch.');

    const user = Meteor.users.findOne({_id: this.userId});

    if (!user)
      throw new Meteor.Error('user-not-found', 'User not found.');

    if (Accounts._checkPassword(user, old).error)
      throw new Meteor.Error('password-incorrect', 'Incorrect old password.');

    // NOTE: Should we throw an error here?
    if (user.emails[0].address === 'demo@docteer.com')
      return;

    Accounts.setPassword(this.userId, new1);
  },

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
      throw new Meteor.Error('validation-error', 'Validation error.');
    }

    settings.schemas.forEach(schema => {
      Object.keys(schema.fields).forEach(key => {
        if (key[0] === '$')
          throw new Meteor.Error('field-with-dollar', 'Field cannot start with a dollar sign.');
        if (key.indexOf('.') !== -1)
          throw new Meteor.Error('field-with-dot', 'Field cannot contain a dot.');
      });
    });

    Meteor.users.update({_id: this.userId}, {$set: settings});
  }
});
