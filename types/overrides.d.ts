import { RequestHandler } from 'express';

declare module 'connect' {
  export interface Server {
    use(fn: RequestHandler): Server;
    use(route: string, fn: RequestHandler): Server;
  }
}

declare global {
  export interface Element {
    blur?(): void;
  }

  export interface Error {
    code?: string;
    text?: string;
  }

  export interface EventTarget {
    __preactattr_?: Record<string, unknown>;
    __skip?: boolean;
    click?(): void;
    contentEditable?: string;
    dataset?: Record<string, string | undefined>;
    parentNode?: EventTarget | null;
    value?: number | string;
  }

  export interface HTMLElement {
    popup?: HTMLElement | null;
  }

  export interface Node {
    contentEditable?: string;
    length?: number;
    wholeText?: string;
  }

  export interface Window {
    __DOCTEER_STATE__: typeof import('../client/state');
    requestIdleCallback: (handle: () => void) => void;
  }
}
