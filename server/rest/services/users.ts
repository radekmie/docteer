import { endpoint } from '..';
import * as users from '../../services/users';

declare module '../../../types' {
  export interface APIEndpoints {
    'POST /users/login': typeof users.login;
    'POST /users/password': typeof users.changePassword;
    'POST /users/register': typeof users.register;
    'POST /users/settings': typeof users.changeSettings;
    'POST /users/token': typeof users.refreshToken;
  }
}

endpoint('POST /users/login', users.login, { authorize: false });
endpoint('POST /users/password', users.changePassword, { authorize: true });
endpoint('POST /users/register', users.register, { authorize: false });
endpoint('POST /users/settings', users.changeSettings, { authorize: true });
endpoint('POST /users/token', users.refreshToken, { authorize: true });
