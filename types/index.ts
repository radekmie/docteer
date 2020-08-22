import { ClientSession, Collection, Db, MongoClient, ObjectId } from 'mongodb';

export type APIContextType = APITransactionType & {
  jwt: string;
  jwtDecoded: { exp: number; sub: string };
  user: UserDocType;
  userId: ObjectId | string;
};

export type APITransactionType = {
  collections: {
    Notes: Collection<NoteDocType>;
    NotesArchive: Collection<NoteDocType>;
    Users: Collection<UserDocType>;
  };
  db: Db;
  mongo: MongoClient;
  session: ClientSession;
};

export type LabelType = {
  active: boolean;
  count: number;
  href: string;
  name: string;
  total: number;
};

export type NoteBase = Record<string, unknown>;

export type NoteDocType<T extends NoteBase = NoteBase> = T & {
  _id: ObjectId | string;
  _id_slug: string;
  _id_user: ObjectId | string;
  _outline: SchemaOutlineType<T>;
  _outname: string;
  _created: Date;
  _removed: Date | null;
  _updated: Date;
  _version: (T & {
    _created: Date;
    _outline: SchemaOutlineType<T>;
    _outname: string;
  })[];
};

export type NotePatchType<T extends NoteBase = NoteBase> = T & {
  _id: string;
  _outline: SchemaOutlineType<T>;
  _outname: string;
};

export type NoteType<T extends NoteBase = NoteBase> = NotePatchType<T> & {
  _active: boolean;
  _created: boolean;
  _href: string;
  _removed: boolean;
  _updated: boolean;
};

export type PassType = {
  algorithm: string;
  digest: string;
};

export type PatchType<
  Created extends string = string,
  Removed extends string = string,
  Updated extends string = string
> = {
  created: Created[];
  removed: Removed[];
  updated: (NotePatchType & { _id: Created | Removed | Updated })[];
};

export type SchemaOutlineFieldType = 'div' | 'ol' | 'ul' | 'textarea';

export type SchemaOutlineType<T extends NoteBase = NoteBase> = {
  name: keyof T;
  type: SchemaOutlineFieldType;
}[];

export type SchemaType<T extends NoteBase = NoteBase> = {
  fields: SchemaOutlineType<T>;
  name: string;
};

export type StateType = ShapeType & StoreType;

export type ShapeType = {
  href: string;
  labels: LabelType[];
  note: NoteType | null;
  notes: NoteType[];
  notesFiltered: NoteType[];
  notesVisible: NoteType[];
  user: UserType | null;
  userLoggedIn: boolean;
  userToken: string | null;
};

export type StoreType = {
  edit: boolean;
  filter: string[];
  help: boolean;
  last: Date;
  load: number;
  noteId: string | null;
  notesCreated: Record<string, true>;
  notesOrigins: NotePatchType[];
  notesRemoved: Record<string, true>;
  notesUpdated: Record<string, NotePatchType>;
  pend: number;
  search: string;
  toasts: ToastType[];
  userData: UserType | null;
  userDiff: Partial<UserType> | null;
  view: '' | 'login' | 'notes' | 'settings' | 'signup';
};

export type ToastType = {
  _id: number;
  dead: boolean;
  marked: boolean;
  text: string;
  type: 'info' | 'error' | 'success';
};

export type UserBaseType = {
  _id: ObjectId | string;
  emails: { address: string; verified?: boolean }[];
  schemas: SchemaType[];
};

export type UserDocType = UserBaseType & {
  createdAt: Date;
  services: { password: { bcrypt: string } };
};

export type UserType = UserBaseType & {
  _changed: boolean;
  token: string;
};
