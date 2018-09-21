// @flow

import SimpleSchema from 'simpl-schema';

import {Meteor} from 'meteor/meteor';

import {Users} from './users';

SimpleSchema.defineValidationErrorTransform(error => {
  const ddpError = new Meteor.Error(error.message);
  ddpError.error = 'validation-error';
  ddpError.details = error.details;
  return ddpError;
});

export function endpoint<Schema: {}>(
  name: string,
  {
    authorize = true,
    handle,
    schema
  }: {|
    authorize?: boolean,
    handle: Schema => *,
    schema: $ObjMap<Schema, () => mixed>
  |}
) {
  const validator = new SimpleSchema({data: new SimpleSchema(schema)});

  Meteor.methods({
    [name](userId, data) {
      const context = {userId};

      validator.clean({data}, {mutate: true});
      validator.validate({data});

      if (authorize && !context.userId)
        throw new Meteor.Error('user-logged-in', 'You must be logged in.');
      if (!authorize && context.userId)
        throw new Meteor.Error('user-logged-out', 'You must be logged out.');

      if (context.userId) {
        if (typeof context.userId !== 'string')
          throw new Meteor.Error('user-not-found', 'User not found.');

        context.user = Users.findOne({_id: context.userId});

        if (!context.user)
          throw new Meteor.Error('user-not-found', 'User not found.');
      }

      return handle.call(context, data);
    }
  });
}
