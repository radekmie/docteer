type DAGStepArgs = any[];
type DAGStep<Context, Args extends DAGStepArgs = DAGStepArgs> = {
  args?: ((context: Context) => MaybeReadonly<Args>) | MaybeReadonly<Args>;
  fn: (...args: Args) => Context | void;
};

type MaybeReadonly<T> = T | Readonly<T>;

export class DAG<Context extends object> {
  constructor(
    public _dead: DAGStep<Context>[] = [],
    public _last: DAGStep<Context>[] = [],
    public _next: DAGStep<Context>[] = [],
  ) {}

  static create() {
    return new DAG<{}>();
  }

  bind() {
    return () => {
      // @ts-expect-error It's valid only at the beginning.
      let context: Context = {};
      for (const step of this._next) {
        context = invoke(context, step);
      }
      for (const step of this._last) {
        context = invoke(context, step);
      }
      for (const step of this._dead) {
        context = invoke(context, step);
      }
      function invoke(context: Context, { args, fn }: DAGStep<Context>) {
        const ready = typeof args === 'function' ? args(context) : args || [];
        return fn.bind(context)(...ready) || context;
      }
    };
  }

  dead<Args extends DAGStepArgs>(
    fn: (...args: Args) => Context | void,
    args?: ((context: Context) => MaybeReadonly<Args>) | MaybeReadonly<Args>,
  ) {
    // @ts-expect-error Force cast arguments.
    return new DAG(this._dead.concat({ args, fn }), this._last, this._next);
  }

  last<Args extends DAGStepArgs>(
    fn: (...args: Args) => Context | void,
    args?: ((context: Context) => MaybeReadonly<Args>) | MaybeReadonly<Args>,
  ) {
    // @ts-expect-error Force cast arguments.
    return new DAG(this._dead, this._last.concat({ args, fn }), this._next);
  }

  next<Args extends DAGStepArgs>(
    fn: (...args: Args) => Context | void,
    args?: ((context: Context) => MaybeReadonly<Args>) | MaybeReadonly<Args>,
  ) {
    // @ts-expect-error Force cast arguments.
    return new DAG(this._dead, this._last, this._next.concat({ args, fn }));
  }

  only(title: string) {
    describe.only(title, this.bind());
  }

  save(title: string) {
    describe(title, this.bind());
  }

  with<ContextNext>(map: (context: Context) => ContextNext) {
    return new DAG<Context & ContextNext>(
      // @ts-expect-error Force cast.
      this._dead,
      this._last,
      this._next.concat({
        args: context => [context],
        fn: context =>
          Object.assign({} as Partial<Context>, context, map(context)),
      }),
    );
  }
}
