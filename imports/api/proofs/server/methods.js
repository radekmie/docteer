import {Meteor} from 'meteor/meteor';
import {check}  from 'meteor/check';

import {bulkPatch} from '/imports/lib/server/bulkPatch';

import {Proofs} from '..';

Meteor.methods({
    'proofs.patch' (patch) {
        check(this.userId, String);
        check(patch, {
            created: [String],
            removed: [String],
            updated: Object
        });

        bulkPatch(Proofs, patch, this.userId).await();
    }
});
