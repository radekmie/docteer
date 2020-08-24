import { BrowserContext } from './_browser';

export function resize(this: BrowserContext, width: number, height: number) {
  it(`should resize to ${width}x${height}`, async () => {
    const page = await this.page;
    await page.setViewportSize({ height, width });
  });
}
