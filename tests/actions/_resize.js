// @flow

export function resize(width: number, height: number) {
  it(`should resize to ${width}x${height}`, async () => {
    const page = await this.page;
    await page.setViewport({height, width});

    // Window frame.
    height += 85;

    const {
      targetInfos: [{targetId}]
    } = await page._client.send('Target.getTargets');

    const {windowId} = await page._client.send('Browser.getWindowForTarget', {
      targetId
    });

    await page._client.send('Browser.setWindowBounds', {
      bounds: {height, width},
      windowId
    });
  });
}
