import { ClientSession, Collection, Db, MongoClient, ObjectId } from 'mongodb';

export type APIContextType = APITransactionType & {
  jwt: string;
  jwtDecoded: { exp: number; sub: string };
  user: UserDocType;
  userId: ObjectId | string;
};

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface APIEndpoints {}

export type APIEndpointParams<
  Endpoint extends keyof APIEndpoints
> = APIEndpoints[Endpoint] extends (
  params: infer Params,
  context: APIContextType,
) => Promise<any>
  ? Params
  : never;

export type APIEndpointResult<
  Endpoint extends keyof APIEndpoints
> = APIEndpoints[Endpoint] extends (
  params: any,
  context: APIContextType,
) => Promise<infer Result>
  ? Result
  : never;

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

export type NoteDocType<T extends NoteBase = NoteBase> = {
  _id: ObjectId | string;
  _id_slug: string;
  _id_user: ObjectId | string;
  _outline: SchemaOutlineType<T>;
  _outname: string;
  _created: Date;
  _objects: T;
  _removed: Date | null;
  _updated: Date;
  _version: {
    _objects: T;
    _outline?: SchemaOutlineType<T>;
    _outname?: string;
    _updated: Date;
  }[];
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

export type PatchType = {
  created: string[];
  removed: string[];
  updated: NotePatchType[];
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
  userDiff: Pick<UserBaseType, 'schemas'> | null;
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
  emails: { address: string; verified?: boolean }[];
  schemas: SchemaType[];
};

export type UserDocType = UserBaseType & {
  _id: ObjectId | string;
  createdAt: Date;
  services: { password: { bcrypt: string } };
};

export type UserType = UserBaseType & {
  _changed?: boolean;
  token: string;
};

declare global {
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
    length?: number;
    wholeText?: string;
  }

  export interface Window {
    __DOCTEER_STATE__: typeof import('../client/state');
    requestIdleCallback: (handle: () => void) => void;
  }
}
