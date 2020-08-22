export function cache<Fn extends (arg: string) => any>(fn: Fn) {
  const cached: Record<string, ReturnType<Fn>> = Object.create(null);

  return (arg => cached[arg] || (cached[arg] = fn(arg))) as Fn;
}
