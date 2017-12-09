declare class Baobab extends events$EventEmitter {
  apply(updater: (any) => any): any;
  clone(): any;
  concat(path: BaobabPath, value: any[]): any;
  deepClone(): any;
  // deepMerge()
  exists(path: BaobabPath): boolean;
  get(path: BaobabPath): any;
  merge(path: BaobabPath, value: any): any;
  // pop
  // project
  push(path: BaobabPath, value: any): any;
  // serialize
  set(path: BaobabPath, value: any): any;
  // shift
  // splice
  unset(path: BaobabPath): void;
  // unshift
  // update()

  static dynamicNode: (
    ...definition: (BaobabPath | ((...paths: any[]) => any))[]
  ) => BaobabMonkeyDefinition;
  static monkey: (
    ...definition: (BaobabPath | ((...paths: any[]) => any))[]
  ) => BaobabMonkeyDefinition;

  commit(): Baobab;
  constructor(initialData?: {}, options?: BaobabOptions): void;
  getMonkey(path: BaobabPath): null | BaobabMonkey;
  release(): void;
  select(): BaobabCursor;
  select(path: BaobabPath): BaobabCursor;
  toJSON(): any;
  toString(): string;
  validate(affectedPaths?: string[][]): boolean;
  watch(mapping: {[string]: BaobabPath}): BaobabWatcher;
}

declare class BaobabCursor extends events$EventEmitter {}

declare class BaobabMonkey {}

declare class BaobabMonkeyDefinition {}

declare type BaobabOptions = {
  asynchronous?: boolean,
  autoCommit?: boolean,
  immutable?: boolean,
  persistent?: boolean,
  pure?: boolean,
  validate?: (prevState: {}, nextState: {}, affectedPaths: string[][]) => void,
  validationBehavior?: 'notify' | 'rollback'
};

declare type BaobabPath = (number | string | {[string]: number | string})[];

declare class BaobabWatcher extends events$EventEmitter {
  get(): any;
  getCursors(): {[string]: BaobabCursor};
  getWatchedPaths(): string[][];
  refresh(mapping: {[string]: BaobabPath}): void;
  release(): void;
}

declare module 'baobab' {
  declare module.exports: typeof Baobab;
}
