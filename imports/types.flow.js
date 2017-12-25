// @flow

export type EventType = {|
  target: {
    dataset: {[string]: string},
    parentNode: HTMLElement,
    value: string
  }
|};

export type InputEventType = {|
  target: HTMLInputElement & {|__skip: ?boolean|}
|};

export type LabelType = {|
  count: number,
  href: string,
  name: string,
  total: number
|};

export type NotePatchType<T> = {|
  _id: string,
  _outline: SchemaOutlineType<T>,
  _outname: string,
  ...T
|};

export type NoteType<T> = {|
  _href: string,
  ...NotePatchType<T>
|};

export type PassType = {|
  algorithm: string,
  digest: string
|};

export type PatchType<Created: string, Removed: string, Updated: string> = {|
  created: Created[],
  removed: Removed[],
  updated: {|_id: Created | Removed | Updated, ...NotePatchType<*>|}[]
|};

export type SchemaOutlineFieldType = 'div' | 'ol' | 'ul' | 'textarea';

export type SchemaOutlineType<T> = $ObjMap<T, () => SchemaOutlineFieldType>;

export type SchemaType<T> = {|
  fields: SchemaOutlineType<T>,
  name: string
|};

export type ToastType = {|
  _id: number,
  dead: boolean,
  text: string,
  type: 'info' | 'error' | 'success'
|};

export type UserType = {|
  _changed: boolean,
  emails: {address: string, verified: boolean}[],
  schemas: SchemaType<*>[]
|};
