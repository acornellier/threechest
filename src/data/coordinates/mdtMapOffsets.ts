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
  //ak
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
  // eda
  2449: {
    x: -481 / 3840,
    y: -445 / 2560,
    scaleX: 5162 / 3840,
    scaleY: 3442 / 2560,
  },
  // gmbt
  1993: {
    x: -252 / 3840,
    y: 1252 / 2560,
    scaleX: 2260 / 3840,
    scaleY: 1508 / 2560,
  },
  1995: {
    x: -9 / 3840,
    y: -86 / 2560,
    scaleX: 4019 / 3840,
    scaleY: 2680 / 2560,
  },
  1996: {
    x: 603 / 3840,
    y: 750 / 2560,
    scaleX: 3629 / 3840,
    scaleY: 2419 / 2560,
  },
  1997: {
    x: 1997 / 3840,
    y: 1997 / 2560,
    scaleX: 1369 / 3840,
    scaleY: 912 / 2560,
  },
  // hoa
  1663: {
    x: 88 / 3840,
    y: -152 / 2560,
    scaleX: 4373 / 3840,
    scaleY: 2916 / 2560,
  },
  1664: {
    x: -314 / 3840,
    y: 1415 / 2560,
    scaleX: 2093 / 3840,
    scaleY: 1677 / 2560,
  },
  // strt
  1989: {
    x: -1910 / 3840,
    y: -582 / 2560,
    scaleX: 6805 / 3840,
    scaleY: 4537 / 2560,
  },
  1990: {
    x: 739 / 3840,
    y: 2259 / 2560,
    scaleX: 1152 / 3840,
    scaleY: 768 / 2560,
  },
}
