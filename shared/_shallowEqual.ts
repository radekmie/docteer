export function shallowEqual<T>(a: T, b: T) {
  if (a === b) {
    return true;
  }

  if (typeof a !== 'object' || typeof b !== 'object' || !a || !b) {
    return false;
  }

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) {
    return false;
  }

  for (let index = 0; index < keysA.length; ++index) {
    // @ts-expect-error Unknown objects.
    if (a[keysA[index]] !== b[keysA[index]]) {
      return false;
    }
  }

  return true;
}
