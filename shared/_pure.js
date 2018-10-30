// @flow

import {shallowEqual} from '@shared';

// $FlowFixMe: Function is unsafe, but we use it as a base.
export function pure<Fn: Function>(fn: Fn): Fn {
  let prevArgs;
  let prevResult;

  return (...args) => {
    if (prevArgs !== undefined && shallowEqual(args, prevArgs))
      return prevResult;

    prevArgs = args;
    prevResult = fn(...args);
    return prevResult;
  };
}
