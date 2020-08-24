export function cache<Fn extends (arg: string) => Result, Result>(fn: Fn) {
  const cached: Record<string, Result> = Object.create(null);

  return (arg => cached[arg] || (cached[arg] = fn(arg))) as Fn;
}
