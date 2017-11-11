// @flow

// $FlowFixMe: No local file.
import {it} from 'meteor/universe:e2e';

import {page} from './_browser';

export function logger() {
  it('should bind page console', () => {
    page.on('console', ({args, type}) => {
      // eslint-disable-next-line no-console
      console[type]('[page]', ...args.map(arg => arg.toString()));
    });
  });
}
