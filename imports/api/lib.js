// @flow

import SimpleSchema from 'simpl-schema';

import {Meteor} from 'meteor/meteor';

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
  const validator = new SimpleSchema(schema);

  Meteor.methods({
    [name](data) {
      if (authorize && !this.userId) throw new Meteor.Error('not-authorized');

      validator.clean(data, {mutate: true});
      validator.validate(data);

      return handle.call(this, data);
    }
  });
}
