// @flow

export function cache<A, B>(fn: A => B): A => B {
  const cached: {[A]: B} = {};

  return (x: A): B => cached[x] || (cached[x] = fn(x));
}
