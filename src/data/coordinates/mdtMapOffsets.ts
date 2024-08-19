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
// 3. Rotate if needed. Then scale and translate the original map to match the MDT map
// 4. If rotated, revert the rotation before entering translation and scale values
// x: offsetX / mdtWidth
// y: offsetY / mdtWidth
// scaleX: originalWidth / mdtWidth
// scaleY: originalHeight / mdtHeight
// rotation: negative rotation
export const mdtMapOffsets: Record<number, MapOffset> = {
  // ak
  2357: {
    x: -175 / 1920,
    y: -80 / 1280,
    scaleX: 2268 / 1920,
    scaleY: 1512 / 1280,
  },
  2358: {
    x: -115 / 1920,
    y: 548 / 1280,
    scaleX: 1435 / 1920,
    scaleY: 957 / 1280,
  },
  // cot
  2343: {
    x: -672 / 1920,
    y: -25 / 1280,
    scaleX: 2990 / 1920,
    scaleY: 1993 / 1280,
  },
  2344: {
    x: -161 / 1920,
    y: 604 / 1280,
    scaleX: 1002 / 1920,
    scaleY: 668 / 1280,
  },
  // gb
  293: {
    x: -143 / 1920,
    y: -29 / 1280,
    scaleX: 2164 / 1920,
    scaleY: 1443 / 1280,
  },
  // mot
  1669: {
    x: -160 / 1920,
    y: 0 / 1280,
    scaleX: 2191 / 1920,
    scaleY: 1461 / 1280,
  },
  // nw
  1666: {
    x: 25 / 1920,
    y: -69 / 1280,
    scaleX: 2030 / 1920,
    scaleY: 1354 / 1280,
  },
  1667: {
    x: 940 / 1920,
    y: 514 / 1280,
    scaleX: 1355 / 1920,
    scaleY: 904 / 1280,
  },
  // sob
  1162: {
    x: -640 / 1920,
    y: -754 / 1280,
    scaleX: 3261 / 1920,
    scaleY: 2174 / 1280,
    rotate: -90,
  },
  // sv
  2341: {
    x: -208 / 1920,
    y: -21 / 1280,
    scaleX: 2183 / 1920,
    scaleY: 1457 / 1280,
  },
}
