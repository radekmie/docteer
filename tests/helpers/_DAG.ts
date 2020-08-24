import isFunction from 'lodash/isFunction';

type Step<T, Args extends unknown[] = unknown[]> = [
  (...args: Readonly<Args>) => T | void,
  ((context: T) => Readonly<Args>) | Readonly<Args> | void,
];

export class DAG<T> {
  private constructor(
    private _dead: Step<T>[] = [],
    private _last: Step<T>[] = [],
    private _next: Step<T>[] = [],
  ) {}

  static create() {
    return new DAG<{}>();
  }

  dead<Args extends unknown[]>(...step: Step<T, Args>) {
    return new DAG([...this._dead, step as Step<T>], this._last, this._next);
  }

  last<Args extends unknown[]>(...step: Step<T, Args>) {
    return new DAG(this._dead, [...this._last, step as Step<T>], this._next);
  }

  next<Args extends unknown[]>(...step: Step<T, Args>) {
    return new DAG(this._dead, this._last, [...this._next, step as Step<T>]);
  }

  only(title: string) {
    describe.only(title, this.start.bind(this));
  }

  save(title: string) {
    describe(title, this.start.bind(this));
  }

  start() {
    [...this._next, ...this._last, ...this._dead].reduce(
      (context, [fn, args]) => {
        args = isFunction(args) ? args(context) : args || [];
        return fn.apply(context, args as unknown[]) || context;
      },
      {} as T,
    );
  }

  with<U>(map: (context: T) => U) {
    return (this.next<[T]>(
      context => ({ ...context, ...map(context) }),
      context => [context],
    ) as unknown) as DAG<T & U>;
  }
}
