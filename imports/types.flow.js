// @flow

declare class TLabel {
  count: number;
  href: string;
  name: string;
  total: number;
}

declare class TNote {
  _id: string;
  _href: string;
}

declare class TToast {
  _id: number;
  type: 'info' | 'error' | 'success';
  text: string;
}

declare class TUser {
  _changed: bool;
  emails: {address: string, verified: bool}[];
  schemas: {[string]: 'div' | 'ol' | 'ul'}[];
}

export type {
  TLabel,
  TNote,
  TToast,
  TUser
};
