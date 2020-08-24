import { BrowserContext } from './_browser';

export function navigate(this: BrowserContext, title: string) {
  it(`should navigate to '${title}'`, async () => {
    const selector = `[data-test-navigation="${title}"]`;
    const page = await this.page;
    await page.click(selector);
  });
}
