// @flow

// $FlowFixMe: How to type these arguments?
type DAGStepArgs = any[];
type DAGStep<Context, Args: DAGStepArgs = DAGStepArgs> = {
  args?: (Context => Args) | Args,
  fn: (...Args) => ?Context
};

export class DAG<Context> {
  _dead: DAGStep<Context>[];
  _last: DAGStep<Context>[];
  _next: DAGStep<Context>[];

  constructor(
    dead: DAGStep<Context>[] = [],
    last: DAGStep<Context>[] = [],
    next: DAGStep<Context>[] = []
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
      let context: $Shape<Context> = {};
      for (const step of this._next) context = invoke(context, step);
      for (const step of this._last) context = invoke(context, step);
      for (const step of this._dead) context = invoke(context, step);

      function invoke(context, {args, fn}) {
        const ready = typeof args === 'function' ? args(context) : args || [];
        return fn.bind(context)(...ready) || context;
      }
    };
  }

  dead<Args: DAGStepArgs>(
    fn: (...Args) => ?Context,
    args?: (Context => Args) | Args
  ): DAG<Context> {
    // $FlowFixMe: Force cast arguments.
    return new DAG(this._dead.concat({args, fn}), this._last, this._next);
  }

  last<Args: DAGStepArgs>(
    fn: (...Args) => ?Context,
    args?: (Context => Args) | Args
  ): DAG<Context> {
    // $FlowFixMe: Force cast arguments.
    return new DAG(this._dead, this._last.concat({args, fn}), this._next);
  }

  next<Args: DAGStepArgs>(
    fn: (...Args) => ?Context,
    args?: (Context => Args) | Args
  ): DAG<Context> {
    // $FlowFixMe: Force cast arguments.
    return new DAG(this._dead, this._last, this._next.concat({args, fn}));
  }

  only(title: string): void {
    describe.only(title, this.bind());
  }

  save(title: string): void {
    describe(title, this.bind());
  }

  with<ContextNext>(map: Context => ContextNext): DAG<Context & ContextNext> {
    // $FlowFixMe: Force cast.
    return new DAG(
      this._dead,
      this._last,
      this._next.concat({
        args: context => [context],
        fn: context =>
          Object.assign(({}: $Shape<Context>), context, map(context))
      })
    );
  }
}
