export function isEqual(x: unknown, y: unknown): boolean {
  const ok = Object.keys
  const tx = typeof x
  const ty = typeof y
  return x && y && tx === 'object' && tx === ty
    ? // @ts-ignore
      ok(x).length === ok(y).length && ok(x).every((key) => isEqual(x[key] as any, y[key]))
    : x === y
}
