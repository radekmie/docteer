import '/imports/api/proofs/server';
import '/imports/api/users/server';
import '/imports/server/graphql';

import {Accounts}       from 'meteor/accounts-base';
import {DDPRateLimiter} from 'meteor/ddp-rate-limiter';

if (process.env.NODE_ENV === 'production') {
    require('/imports/server/optimize');
}

Accounts.config({
    ambiguousErrorMessages:      true,
    forbidClientAccountCreation: true
});

DDPRateLimiter.setErrorMessage('Slow down!');
