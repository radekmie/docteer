import {Meteor} from 'meteor/meteor';

import {Proofs} from '..';

Meteor.publish('proofs.mine', function publishProofsMine () {
    return Proofs.find({userId: this.userId}, {fields: {userId: 0}});
});
