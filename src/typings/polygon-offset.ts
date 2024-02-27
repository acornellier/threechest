declare module 'polygon-offset' {
  class Offset {
    data: (points: Array<[number, number]>) => Offset
    arcSegments: (segments: number) => Offset
    margin: (margin: number) => Array<[number, number]>
  }

  export = Offset
}
