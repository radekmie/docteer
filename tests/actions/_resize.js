// @flow

export function resize(width: number, height: number) {
  it(`should resize to ${width}x${height}`, async () => {
    const page = await this.page;
    await page.setViewport({height, width});

    const browser = await this.browser;
    const version = await browser.version();
    if (version.startsWith('Headless')) return;

    // Window frame.
    height += 85;

    const {targetInfos} = await page._client.send('Target.getTargets');
    const {targetId} = targetInfos.find(info => info.attached);
    const {windowId} = await page._client.send('Browser.getWindowForTarget', {
      targetId
    });

    await page._client.send('Browser.setWindowBounds', {
      bounds: {height, width},
      windowId
    });
  });
}
