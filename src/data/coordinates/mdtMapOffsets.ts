// top left corners

export interface MapOffset {
  x: number
  y: number
  scaleX: number
  scaleY: number
  rotate?: number
}

// 1. In GIMP, open the MDT map
// 2. Add a layer overlaying it with the original wow map, set its alpha to 50%
// 3. Scale, translate, and rotate the original map to match the MDT map
// x: offsetX / mdtWidth
// y: offsetY / mdtWidth
// scaleX: originalWidth / mdtWidth
// scaleY: originalHeight / mdtHeight
export const mdtMapOffsets: Record<number, MapOffset> = {
  // cot
  2343: {
    x: -672 / 1920,
    y: -25 / 1280,
    scaleX: 2990 / 1920,
    scaleY: 1993 / 1280,
  },
  2344: {
    x: -173 / 1920,
    y: 480 / 1080,
    scaleX: 1002 / 1920,
    scaleY: 668 / 1080,
  },
}
