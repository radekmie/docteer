// @flow

import {Kadira} from 'meteor/mdg:meteor-apm-agent';
import {Meteor} from 'meteor/meteor';

const kadira = Meteor.settings.kadira;

if (kadira && kadira.appId && kadira.appSecret)
  Kadira.connect(kadira.appId, kadira.appSecret, kadira.options || {});
