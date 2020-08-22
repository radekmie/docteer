import { BrowserContext } from './_browser';

export function load(this: BrowserContext, path: string) {
  it(`should load ${path}`, async () => {
    const page = await this.page;
    await page.goto(`http://localhost:3000${path}`);
    await page.waitForSelector('main:not(.hidden)');
  });
}
