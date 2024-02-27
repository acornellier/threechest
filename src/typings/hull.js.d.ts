declare module 'hull.js' {
  const makeHull: (points: Array<[number, number]>, concavity: number) => Array<[number, number]>

  export = makeHull
}
