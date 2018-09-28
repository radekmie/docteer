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

export type LabelType = {|
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
  _id: ObjectId | string,
  _changed: boolean,
  emails: {address: string, verified: boolean}[],
  schemas: SchemaType<*>[]
|};
