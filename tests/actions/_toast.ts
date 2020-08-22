import { BrowserContext } from './_browser';

export function toastCheck(this: BrowserContext, text: string) {
  it(`should show toast '${text}'`, async () => {
    const page = await this.page;
    await page.waitForSelector(`[data-test-toast="${text}"]`);
    await page.waitForSelector('[data-test-toasts]');
  });
}
