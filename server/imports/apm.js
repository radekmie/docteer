// @flow

import {Kadira} from 'meteor/mdg:meteor-apm-agent';
import {Meteor} from 'meteor/meteor';

const kadira = Meteor.settings.kadira;

if (kadira && kadira.appId && kadira.appSecret)
  Kadira.connect(kadira.appId, kadira.appSecret, kadira.options || {});

// Silent Kadira warnings.
const endLastEvent = Kadira.Tracer.prototype.endLastEvent;
Kadira.Tracer.prototype.endLastEvent = function () {
  endLastEvent.apply(this, arguments);
  return false;
};
