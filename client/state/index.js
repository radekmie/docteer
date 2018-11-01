// @flow

export * from './_shape';
export * from './_state';

if (process.env.NODE_ENV === 'production')
  require('immer').setAutoFreeze(false);
