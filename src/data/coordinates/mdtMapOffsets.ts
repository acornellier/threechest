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
  1491: {
    x: -100 / 1920,
    y: 350 / 1080,
    scaleX: 1336 / 1920,
    scaleY: 852 / 1080,
  },
  1494: {
    x: 813 / 1920,
    y: 274 / 1080,
    scaleX: 1370 / 1920,
    scaleY: 915 / 1080,
  },
  1497: {
    x: -100 / 1920,
    y: -50 / 1080,
    scaleX: 1170 / 1920,
    scaleY: 815 / 1080,
  },
  //of
  2387: {
    x: -0.25,
    y: 0,
    scaleX: 1.2,
    scaleY: 1,
  },
  2388: {
    x: 0.35,
    y: 0.05,
    scaleX: 0.88,
    scaleY: 0.8,
  },
  // psf
  2308: {
    x: 672 / 1920,
    y: 20 / 1080,
    scaleX: 1430 / 1920,
    scaleY: 955 / 1080,
    rotate: 4,
  },
  2309: {
    x: -29 / 1920,
    y: 120 / 1080,
    scaleX: 1202 / 1920,
    scaleY: 802 / 1080,
    rotate: -5,
  },
  2330: {
    // copy of 2308, seems to be a dup?
    x: 692 / 1920,
    y: 145 / 1080,
    scaleX: 1430 / 1920,
    scaleY: 955 / 1080,
    rotate: 4,
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
    y: 524 / 1080,
    scaleX: 1002 / 1920,
    scaleY: 668 / 1080,
  },
  1685: {
    x: 599 / 1920,
    y: -104 / 1080,
    scaleX: 1136 / 1920,
    scaleY: 758 / 1080,
  },
  1686: {
    x: 433 / 1920,
    y: 306 / 1080,
    scaleX: 920 / 1920,
    scaleY: 614 / 1080,
    rotate: -3.83,
  },
  1687: {
    x: -85 / 1920,
    y: 506 / 1080,
    scaleX: 944 / 1920,
    scaleY: 632 / 1080,
  },
  // rook
  2315: {
    x: 646 / 1920,
    y: -5 / 1080,
    scaleX: 1264 / 1920,
    scaleY: 843 / 1080,
  },
  2316: {
    x: 504 / 1920,
    y: 10 / 1080,
    scaleX: 926 / 1920,
    scaleY: 618 / 1080,
  },
  2318: {
    x: -309 / 1920,
    y: -150 / 1080,
    scaleX: 1348 / 1920,
    scaleY: 900 / 1080,
  },
  2319: {
    x: 186 / 1920,
    y: 457 / 1080,
    scaleX: 988 / 1920,
    scaleY: 658 / 1080,
  },
  2320: {
    x: 577 / 1920,
    y: 470 / 1080,
    scaleX: 1418 / 1920,
    scaleY: 778 / 1080,
  },
}
