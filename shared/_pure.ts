import { shallowEqual } from './';

export function pure<Args extends any[], Result>(
  fn: (...args: Args) => Result,
) {
  let prevArgs: Args;
  let prevResult: Result;

  return (...args: Args) => {
    if (prevArgs !== undefined && shallowEqual(args, prevArgs)) {
      return prevResult;
    }

    prevArgs = args;
    prevResult = fn(...args);
    return prevResult;
  };
}
