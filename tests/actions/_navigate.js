// @flow

export function navigate(title: string) {
  it(`should navigate to '${title}'`, async () => {
    const selector = `[data-test-navigation="${title}"]`;
    const page = await this.page;
    await page.waitForSelector(selector);
    await page.click(selector);
  });
}
