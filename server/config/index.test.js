// @flow

import config from '@server/config';

describe('Config', () => {
  it('is an object', () => {
    expect(config).toEqual(expect.any(Object));
  });
});
