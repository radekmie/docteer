import * as api from '../../api';
import { endpoint } from './_endpoint';

declare module '../../../types' {
  export interface APIEndpoints {
    'GET /notes': typeof api.notes.getMine;
    'POST /notes': typeof api.notes.patchMine;
    'POST /users/login': typeof api.users.login;
    'POST /users/password': typeof api.users.changePassword;
    'POST /users/register': typeof api.users.register;
    'POST /users/settings': typeof api.users.changeSettings;
    'POST /users/token': typeof api.users.refreshToken;
  }
}

// prettier-ignore
export const endpoints = [
  endpoint('GET /notes', api.notes.getMine, { authorize: true }),
  endpoint('POST /notes', api.notes.patchMine, { authorize: true }),
  endpoint('POST /users/login', api.users.login, { authorize: false }),
  endpoint('POST /users/password', api.users.changePassword, { authorize: true }),
  endpoint('POST /users/register', api.users.register, { authorize: false }),
  endpoint('POST /users/settings', api.users.changeSettings, { authorize: true }),
  endpoint('POST /users/token', api.users.refreshToken, { authorize: true }),
];
