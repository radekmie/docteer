import {Meteor} from 'meteor/meteor';

import {publishWithFieldAsId} from '/imports/lib/server/publishWithFieldAsId';

import {Proofs} from '..';

Meteor.publish('proofs.mine', function publishProofsMine () {
    publishWithFieldAsId(this, '_ud', Proofs.find(
        {userId: this.userId},
        {fields: {userId: 0}}
    ));

    this.ready();
});
