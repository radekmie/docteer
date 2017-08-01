import {Meteor} from 'meteor/meteor';

import {PlainCollection} from '/imports/lib';

export const TestCases = new PlainCollection('testcases');

Meteor.publish('testcases', function testcases () {
    return TestCases.find();
});
