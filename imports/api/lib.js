// @flow

import SimpleSchema from 'simpl-schema';

import {Meteor} from 'meteor/meteor';

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
    [name](data) {
      if (authorize && !this.userId)
        throw new Meteor.Error('user-logged-in', 'You must be logged in.');
      if (!authorize && this.userId)
        throw new Meteor.Error('user-logged-out', 'You must be logged out.');

      validator.clean({data}, {mutate: true});
      validator.validate({data});

      return handle.call(this, data);
    }
  });
}
