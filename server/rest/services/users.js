// @flow

import * as users from '@server/services/users';
import {endpoint} from '@server/rest';

endpoint('POST', '/users/login', users.login, {authorize: false});
endpoint('POST', '/users/password', users.changePassword, {authorize: true});
endpoint('POST', '/users/register', users.register, {authorize: false});
endpoint('POST', '/users/settings', users.changeSettings, {authorize: true});
endpoint('POST', '/users/token', users.refreshToken, {authorize: true});