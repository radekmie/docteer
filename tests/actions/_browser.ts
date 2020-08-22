import { getBrowserContext } from '../helpers';

export type BrowserContext = ReturnType<typeof browserOpen>;

export function browserClose(this: BrowserContext) {
  it('should close the browser', () => this.release.then(release => release()));
}

export function browserOpen() {
  const $ = getBrowserContext();
  const browser = $.then(({ browser }) => browser);
  const page = $.then(({ page }) => page);
  const release = $.then(({ release }) => release);

  return { browser, page, release };
}
