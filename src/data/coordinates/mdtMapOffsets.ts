// top left corners

export interface MapOffset {
  x: number
  y: number
  scaleX: number
  scaleY: number
  rotate?: number
}

// 1. In GIMP, open the MDT map
// 2. Find an original wow map in https://wago.tools/maps/worldmap, its id is the key
// 3. Add a layer overlaying it with the original wow map, set its alpha to 50%
// 4. Rotate if needed. Then scale and translate the original map to match the MDT map
// 5. If rotated, revert the rotation before entering translation and scale values
// x: offsetX / mdtWidth
// y: offsetY / mdtWidth
// scaleX: originalWidth / mdtWidth
// scaleY: originalHeight / mdtHeight
// rotation: negative rotation
export const mdtMapOffsets: Record<number, MapOffset> = {
  // mw
  1573: {
    x: -154 / 1920,
    y: -64 / 1080,
    scaleX: 1336 / 1920,
    scaleY: 892 / 1080,
  },
  1574: {
    x: 813 / 1920,
    y: 424 / 1080,
    scaleX: 1370 / 1920,
    scaleY: 915 / 1080,
  },
  // psf
  2308: {
    x: 678 / 1920,
    y: 145 / 1080,
    scaleX: 1445 / 1920,
    scaleY: 964 / 1080,
    rotate: 3.3,
  },
  2309: {
    x: -29 / 1920,
    y: 230 / 1080,
    scaleX: 1202 / 1920,
    scaleY: 802 / 1080,
    rotate: 5.5,
  },
  2330: {
    // copy of 2308, seems to be a dup?
    x: 678 / 1920,
    y: 145 / 1080,
    scaleX: 1445 / 1920,
    scaleY: 964 / 1080,
    rotate: 3.3,
  },
  // top
  1683: {
    x: -338 / 1920,
    y: -63 / 1080,
    scaleX: 1334 / 1920,
    scaleY: 889 / 1080,
  },
  1684: {
    x: 1094 / 1920,
    y: 674 / 1080,
    scaleX: 1002 / 1920,
    scaleY: 668 / 1080,
  },
  1685: {
    x: 599 / 1920,
    y: -34 / 1080,
    scaleX: 1136 / 1920,
    scaleY: 758 / 1080,
  },
  1686: {
    x: 433 / 1920,
    y: 436 / 1080,
    scaleX: 920 / 1920,
    scaleY: 614 / 1080,
    rotate: -3.83,
  },
  1687: {
    x: -85 / 1920,
    y: 646 / 1080,
    scaleX: 944 / 1920,
    scaleY: 632 / 1080,
  },
  // tr
  2315: {
    x: 85 / 1920,
    y: 80 / 1080,
    scaleX: 1002 / 1920,
    scaleY: 668 / 1080,
  },
  2316: {
    x: 504 / 1920,
    y: 87 / 1080,
    scaleX: 926 / 1920,
    scaleY: 618 / 1080,
  },
  2318: {
    x: 1154 / 1920,
    y: 33 / 1080,
    scaleX: 1002 / 1920,
    scaleY: 668 / 1080,
  },
  2319: {
    x: 126 / 1920,
    y: 607 / 1080,
    scaleX: 988 / 1920,
    scaleY: 658 / 1080,
  },
  2320: {
    x: 777 / 1920,
    y: 602 / 1080,
    scaleX: 1018 / 1920,
    scaleY: 678 / 1080,
  },
}
