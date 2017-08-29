import {Accounts}       from 'meteor/accounts-base';
import {DDPRateLimiter} from 'meteor/ddp-rate-limiter';

Accounts.config({
  ambiguousErrorMessages:      true,
  forbidClientAccountCreation: true,

  // NOTE: Keep it limited.
  loginExpirationInDays: 1
});

DDPRateLimiter.setErrorMessage('Slow down!');
