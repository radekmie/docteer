// @flow

import {describe} from 'meteor/universe:e2e';

type DAGStep<Context, Args = any> = {
  args: (Context => Args) | Args,
  fn: (...Args) => ?Context
};

export class DAG<Context> {
  _last: DAGStep<Context>[];
  _next: DAGStep<Context>[];

  constructor(next: DAGStep<Context>[] = [], last: DAGStep<Context>[] = []) {
    this._last = last;
    this._next = next;
  }

  static create(): DAG<{}> {
    return new DAG();
  }

  bind(): () => void {
    return (): void => {
      const step = (context: $Shape<Context>, {args, fn}): $Shape<Context> =>
        fn(...(Array.isArray(args) ? args : args(context))) || context;

      this._last.reduce(step, this._next.reduce(step, {}));
    };
  }

  last<Args>(
    fn: (...Args) => ?Context,
    args: (Context => Args) | Args
  ): DAG<Context> {
    // $FlowFixMe
    return new DAG(this._next, this._last.concat({args, fn}));
  }

  next<Args>(
    fn: (...Args) => ?Context,
    args: (Context => Args) | Args
  ): DAG<Context> {
    // $FlowFixMe
    return new DAG(this._next.concat({args, fn}), this._last);
  }

  only(title: string): void {
    describe.only(title, this.bind());
  }

  save(title: string): void {
    describe(title, this.bind());
  }

  with<ContextNext>(map: Context => ContextNext): DAG<Context & ContextNext> {
    // $FlowFixMe
    const id = ($: DAGStep<Context>[]) => ($: DAGStep<Context & ContextNext>[]);

    return new DAG(
      id(this._next).concat({
        args: context => [context],
        fn: context => Object.assign({}, context, map(context))
      }),
      id(this._last)
    );
  }
}
