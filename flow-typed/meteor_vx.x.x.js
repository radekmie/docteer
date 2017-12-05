// @flow
/* eslint-disable */

declare class Collection<T> {
  _ensureIndex(index: {}, options?: {}): void;
  constructor(name: string): void;
  find<U>(selector?: string | ObjectId | Selector, options?: {fields?: FieldSpecifier; limit?: number; reactive?: boolean; skip?: number; sort?: SortSpecifier; transform?: T => U;}): Cursor<U>;
  findOne<U>(selector?: string | ObjectId | Selector, options?: {fields?: FieldSpecifier; limit?: number; reactive?: boolean; skip?: number; sort?: SortSpecifier; transform?: T => U;}): ?U;
  rawCollection(): RawCollection<T>;
  update(selector: string | ObjectId | Selector, modifier: Modifier, options?: {multi?: boolean; upsert?: boolean;}): number;
  update(selector: string | ObjectId | Selector, modifier: Modifier, options?: {multi?: boolean; upsert?: boolean;}, callback: (((Error, void) => mixed) & ((void, number) => mixed))): void;
}

declare class Cursor<T> {
  fetch(): T[];
  forEach(T => mixed): void;
  map<U>(T => U): U[];
}

declare type FieldSpecifier = {
  [string]: 0 | 1;
};

declare class MeteorError {
  constructor(error: string | number, reason?: string, details?: string): void;
  details?: string;
  error: string | number;
  reason?: string;
}

declare type Modifier = {
  [string]: mixed;
};

declare class ObjectId {
  _str: string;
  constructor(hex: string): void;
}

declare class RawCollection<T> {
  bulkWrite(pipeline: {}[]): Promise<{}>;
  deleteMany(selector: Selector): Promise<{}>;
  insertMany(docs: T[]): Promise<{}>;
}

declare type Selector = {
  [string]: mixed;
};

declare type SortSpecifier = {
  [string]: -1 | 1;
};

declare class SubscriptionHandle {
  ready(): boolean;
  stop(): void;
}

declare type User = {
  _id: string;
  createdAt?: number;
  emails?: {address: string; verified?: boolean;}[];
  profile?: mixed;
  services?: mixed;
  username?: string;
  [string]: mixed;
};

declare module 'meteor/meteor' {
  declare class Meteor {
    Error: typeof MeteorError;
    absoluteUrl(path?: string, options?: {replaceLocalhost?: boolean; rootUrl?: string; secure?: boolean}): string;
    call<T, A1, A2>(method: string, arg1: A1, arg2: A2, callback?: (((Error, void) => mixed) & ((void, T) => mixed))): void;
    call<T, A1>(method: string, arg1: A1, callback?: (((Error, void) => mixed) & ((void, T) => mixed))): void;
    call<T>(method: string, callback?: (((Error, void) => mixed) & ((void, T) => mixed))): void;
    isClient: boolean;
    isCordova: boolean;
    isProduction: boolean;
    isServer: boolean;
    loginWithPassword(user: string | {|email: string|} | {|id: string|} | {|username: string|}, password: string, callback?: (?Error) => mixed): void;
    logout(callback?: (?Error) => mixed): void;
    methods({[name: string]: (...args: mixed[]) => mixed}): void;
    publish(name: string, publication: (...args: mixed[]) => mixed): void;
    publish({[name: string]: (...args: mixed[]) => mixed}): void;
    release: string;
    settings: {public: {[string]: mixed}, [string]: mixed};
    startup(callback: () => mixed): void;
    subscribe(name: string, ...args: mixed[]): SubscriptionHandle;
    user(): ?User;
    userId(): ?string;
    users: Collection<User>;
    wrapAsync<T, A1, A2>(arg1: A1, arg2: A2, callback?: (((Error, void) => mixed) & ((void, T) => mixed))): (A1, A2) => T;
    wrapAsync<T, A1>(arg1: A1, callback?: (((Error, void) => mixed) & ((void, T) => mixed))): (A1) => T;
    wrapAsync<T>(callback?: (((Error, void) => mixed) & ((void, T) => mixed))): () => T;
  }

  declare module.exports: {
    Meteor: Meteor;
  };
}

declare module 'meteor/mongo' {
  declare class Mongo {
    Collection: typeof Collection;
  }

  declare class MongoInternals {
    NpmModules: {
      mongodb: {
        module: {
          ObjectId: typeof ObjectId;
        };
      };
    };
  }

  declare module.exports: {
    Mongo: Mongo;
    MongoInternals: MongoInternals;
  };
}
