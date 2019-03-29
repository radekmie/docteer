// @flow

import type {ClientSession} from 'mongodb';
import type {Collection} from 'mongodb';
import type {Db} from 'mongodb';
import type {MongoClient} from 'mongodb';
import type {ObjectId} from 'mongodb';

export type APIContextType = {|
  jwt: string,
  jwtDecoded: {|exp: number, sub: string|},
  user: {|...UserType, services: {|password: {|bcrypt: string|}|}|},
  userId: ObjectId | string,
  ...APITransactionType
|};

export type APITransactionType = {|
  collections: {|
    Notes: Collection,
    NotesArchive: Collection,
    Users: Collection
  |},
  db: Db,
  mongo: MongoClient,
  session: ClientSession
|};

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

export type KeyboardEventType = KeyboardEvent & {|
  target: HTMLInputElement & {|__skip: ?boolean|}
|};

export type LabelType = {|
  active: boolean,
  count: number,
  href: string,
  name: string,
  total: number
|};

export type NoteDocType<T> = {|
  _id: ObjectId,
  _id_slug: string,
  _id_user: string,
  _outline: SchemaOutlineType<T>,
  _outname: string,
  _created: Date,
  _removed: Date | null,
  _updated: Date,
  _version: {|
    _created: Date,
    _outline: SchemaOutlineType<T>,
    _outname: string,
    ...T
  |}[],
  ...T
|};

// $FlowFixMe: * is deprecated
export type NotePatchType<T = *> = {|
  _id: string,
  _outline: SchemaOutlineType<T>,
  _outname: string,
  ...T
|};

// $FlowFixMe: * is deprecated
export type NoteType<T = *> = {|
  _active: boolean,
  _created: boolean,
  _href: string,
  _removed: boolean,
  _updated: boolean,
  ...NotePatchType<T>
|};

export type PassType = {|
  algorithm: string,
  digest: string
|};

export type PatchType<
  Created: string = string,
  Removed: string = string,
  Updated: string = string
> = {|
  created: Created[],
  removed: Removed[],
  updated: {|_id: Created | Removed | Updated, ...NotePatchType<>|}[]
|};

export type SchemaOutlineFieldType = 'div' | 'ol' | 'ul' | 'textarea';

export type SchemaOutlineType<T> = {|
  name: $Keys<T>,
  type: SchemaOutlineFieldType
|}[];

// $FlowFixMe: * is deprecated
export type SchemaType<T = *> = {|
  fields: SchemaOutlineType<T>,
  name: string
|};

export type StateType = {|
  ...ShapeType,
  ...StoreType
|};

export type ShapeType = {|
  href: string,
  labels: LabelType[],
  note: NoteType | null,
  notes: NoteType[],
  notesFiltered: NoteType[],
  notesVisible: NoteType[],
  user: UserType | null,
  userLoggedIn: boolean,
  userToken: string | null
|};

export type StoreType = {|
  edit: boolean,
  filter: string[],
  help: boolean,
  last: Date,
  load: number,
  noteId: string | null,
  notesCreated: {[string]: true},
  notesOrigins: NotePatchType[],
  notesRemoved: {[string]: true},
  notesUpdated: {[string]: NotePatchType},
  pend: number,
  search: string,
  toasts: ToastType[],
  userData: UserType | null,
  userDiff: $Shape<UserType> | null,
  view: '' | 'login' | 'notes' | 'settings' | 'signup'
|};

export type ToastType = {|
  _id: number,
  dead: boolean,
  marked: boolean,
  text: string,
  type: 'info' | 'error' | 'success'
|};

export type UserType = {|
  _id: ObjectId | string,
  _changed: boolean,
  emails: {address: string, verified: boolean}[],
  schemas: SchemaType<>[],
  token: string
|};
