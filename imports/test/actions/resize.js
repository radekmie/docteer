// @flow

// $FlowFixMe: No local file.
import {it} from 'meteor/universe:e2e';

import {browser} from '../helpers';
import {page} from '../helpers';

export function resize(width: number, height: number) {
  it(`should resize to ${width}x${height}`, async () => {
    await page.setViewport({height, width});

    // Window frame.
    height += 85;

    const {targetInfos: [{targetId}]} = await browser._connection.send(
      'Target.getTargets'
    );

    const {windowId} = await browser._connection.send(
      'Browser.getWindowForTarget',
      {targetId}
    );

    await browser._connection.send('Browser.setWindowBounds', {
      bounds: {height, width},
      windowId
    });
  });
}
