// @flow

type DAGStep<Context, Args: Array<*>> = {
  args: (Context => Args) | Args,
  fn: (...Args) => ?Context
};

export class DAG<Context> {
  _dead: DAGStep<Context, *>[];
  _last: DAGStep<Context, *>[];
  _next: DAGStep<Context, *>[];

  constructor(
    dead: DAGStep<Context, *>[] = [],
    last: DAGStep<Context, *>[] = [],
    next: DAGStep<Context, *>[] = []
  ) {
    this._dead = dead;
    this._last = last;
    this._next = next;
  }

  static create(): DAG<{}> {
    return new DAG();
  }

  bind(): () => void {
    return (): void => {
      const step = (context: $Shape<Context>, {args, fn}): $Shape<Context> =>
        fn.apply(context, Array.isArray(args) ? args : args(context)) ||
        context;

      [].concat(this._next, this._last, this._dead).reduce(step, {});
    };
  }

  dead<Args: Array<*>>(
    fn: (...Args) => ?Context,
    args: (Context => Args) | Args = []
  ): DAG<Context> {
    return new DAG(this._dead.concat({args, fn}), this._last, this._next);
  }

  last<Args: Array<*>>(
    fn: (...Args) => ?Context,
    args: (Context => Args) | Args = []
  ): DAG<Context> {
    return new DAG(this._dead, this._last.concat({args, fn}), this._next);
  }

  next<Args: Array<*>>(
    fn: (...Args) => ?Context,
    args: (Context => Args) | Args = []
  ): DAG<Context> {
    return new DAG(this._dead, this._last, this._next.concat({args, fn}));
  }

  only(title: string): void {
    describe.only(title, this.bind());
  }

  save(title: string): void {
    describe(title, this.bind());
  }

  with<ContextNext>(map: Context => ContextNext): DAG<Context & ContextNext> {
    return new DAG(
      // $FlowFixMe
      (this._dead: DAGStep<Context & ContextNext>[]),
      // $FlowFixMe
      (this._last: DAGStep<Context & ContextNext>[]),
      // $FlowFixMe
      (this._next: DAGStep<Context & ContextNext>[]).concat({
        args: context => [context],
        fn: context =>
          Object.assign(({}: $Shape<Context>), context, map(context))
      })
    );
  }
}
