// @flow

import {Match} from 'meteor/check';
import {Accounts} from 'meteor/accounts-base';
import {Meteor} from 'meteor/meteor';
import {check} from 'meteor/check';

import {endpoint} from '../../lib';

import type {PatchType} from '../../../types.flow';
import type {SchemaType} from '../../../types.flow';

const defaultPatch: PatchType<> = {
  created: ['introduction'],
  removed: [],
  updated: [
    {
      _id: 'introduction',
      _outline: {name: 'div', labels: 'ul'},
      _outname: 'Example',
      name: 'Introduction',
      labels: []
    }
  ]
};

const defaultSchemas: SchemaType<>[] = [
  {name: 'Default', fields: {name: 'div', labels: 'ul', text: 'div'}}
];

endpoint('POST /users/password', {
  handle({new1, new2, old}: {|new1: string, new2: string, old: string|}) {
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

    if (!user) throw new Meteor.Error('user-not-found', 'User not found.');

    if (Accounts._checkPassword(user, old).error)
      throw new Meteor.Error('password-incorrect', 'Incorrect old password.');

    // NOTE: Should we throw an error here?
    if (user.emails[0].address === 'demo@docteer.com') return;

    Accounts.setPassword(this.userId, new1, {logout: false});
  },

  schema: {
    old: String,
    new1: String,
    new2: String
  }
});

endpoint('POST /users/register', {
  authorize: false,
  handle({email, password}: {|email: string, password: string|}) {
    try {
      check(this.userId, null);
      check(email, String);
      check(password, String);
    } catch (error) {
      throw new Meteor.Error('validation-error', 'Validation error.');
    }

    let _id;
    try {
      _id = Accounts.createUser({email, password});
    } catch (error) {
      if (error.error === 403)
        throw new Meteor.Error('user-exists', 'User already exists.');
      throw error;
    }

    this.setUserId(_id);

    Meteor.users.update({_id}, {$set: {schemas: defaultSchemas}});
    Meteor.call('POST /notes', {patch: defaultPatch, refresh: Infinity});
  },

  schema: {
    email: String,
    password: String
  }
});

endpoint('POST /users/settings', {
  handle({settings}: {|settings: {|schemas: SchemaType<>[]|}|}) {
    try {
      check(this.userId, String);
      check(settings, {schemas: [Object]});
      check(
        settings.schemas,
        Match.Where(schemas => {
          schemas.forEach(schema => {
            check(schema, {name: String, fields: Object});
            Object.keys(schema.fields).forEach(key => {
              check(schema.fields[key], Match.OneOf('div', 'ol', 'ul'));
            });
          });

          return true;
        })
      );
    } catch (error) {
      throw new Meteor.Error('validation-error', 'Validation error.');
    }

    settings.schemas.forEach(schema => {
      Object.keys(schema.fields).forEach(key => {
        if (key[0] === '$')
          throw new Meteor.Error(
            'field-with-dollar',
            'Field cannot start with a dollar sign.'
          );
        if (key.indexOf('.') !== -1)
          throw new Meteor.Error(
            'field-with-dot',
            'Field cannot contain a dot.'
          );
      });
    });

    Meteor.users.update({_id: this.userId}, {$set: settings});
  },

  schema: {
    settings: String
  }
});
