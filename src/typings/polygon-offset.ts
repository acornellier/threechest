declare module 'polygon-offset' {
  class Offset {
    data: (points: Array<[number, number]>) => Offset
    arcSegments: (segments: number) => Offset
    margin: (margin: number) => Array<Array<[number, number]>>
  }

  export = Offset
}
