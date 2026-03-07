// top left corners

export interface MapOffset {
  x: number
  y: number
  scaleX: number
  scaleY: number
  rotate?: number
}

const mdtWidth = 3840
const mdtHeight = 2560

// 1. In Photopea, open the MDT map
// 2. Find an original wow map in https://wago.tools/maps/worldmap, its id is the key
// 3. Add a layer overlaying it with the original wow map, set its opacity to 50%
// 4. Rotate if needed. Then scale and translate the original map to match the MDT map
// 5. If rotated, revert the rotation before entering translation and scale values
// 6. Retrieve W/H/X/Y from layer properties (select layer and click the (i))
// rotation: negative rotation
const rawMdtMapOffsets: Record<
  number,
  { x: number; y: number; w: number; h: number; rotate?: number }
> = {
  // aa
  2097: {
    w: 4175,
    h: 2783,
    x: -59,
    y: 316,
  },
  2098: {
    w: 1632,
    h: 1088,
    x: 1579,
    y: -161,
  },
  // cavns
  2501: {
    w: 4768,
    h: 3180,
    x: -643,
    y: -478,
  },
  // magi
  2511: {
    w: 2740,
    h: 1828,
    x: 673,
    y: -188,
    rotate: 60,
  },
  25112511: {
    // void version
    w: 2740,
    h: 1828,
    x: 1485,
    y: 966,
    rotate: 60,
  },
  2515: {
    w: 1844,
    h: 1232,
    x: -270,
    y: 223,
    rotate: -120,
  },
  2516: {
    w: 1652,
    h: 1104,
    x: 2364,
    y: 131,
    rotate: 75,
  },
  25162516: {
    // void version
    w: 1652,
    h: 1104,
    x: 2639,
    y: 318,
    rotate: -60,
  },
  2517: {
    w: 1560,
    h: 1040,
    x: 505,
    y: 1783,
    rotate: 155,
  },
  2518: {
    w: 1002,
    h: 668,
    x: 841,
    y: 1318,
  },
  2519: {
    w: 968,
    h: 644,
    x: 167,
    y: 1196,
  },
  // pit
  184: {
    w: 4612,
    h: 3076,
    x: -648,
    y: -93,
  },
  // seat
  903: {
    w: 4328,
    h: 2888,
    x: -207,
    y: -208,
  },
  // sky
  601: {
    w: 4532,
    h: 3024,
    x: -1353,
    y: -188,
  },
  602: {
    w: 3104,
    h: 2068,
    x: 1396,
    y: 401,
  },
  // wind
  2492: {
    w: 2012,
    h: 1340,
    x: -418,
    y: 59,
  },
  2493: {
    // should be mirrored vertically
    w: 2032,
    h: 1356,
    x: -459,
    y: 1206,
    rotate: 180,
  },
  2494: {
    w: 1952,
    h: 1304,
    x: 1396,
    y: 18,
  },
  2496: {
    // should be mirrored vertically
    w: 1828,
    h: 1220,
    x: 526,
    y: 142,
    rotate: 180,
  },
  2497: {
    w: 1984,
    h: 1324,
    x: 339,
    y: 1173,
  },
  2498: {
    w: 1408,
    h: 940,
    x: 1662,
    y: 1557,
  },
  2499: {
    w: 1996,
    h: 1332,
    x: 2026,
    y: 688,
  },
  // xenas
  2556: {
    w: 3816,
    h: 2544,
    x: 0,
    y: 0,
  },
}

export const mdtMapOffsets: Record<number, MapOffset> = Object.fromEntries(
  Object.entries(rawMdtMapOffsets).map(([k, { x, y, w, h, rotate }]) => [
    Number(k),
    {
      x: x / mdtWidth,
      y: y / mdtHeight,
      scaleX: w / mdtWidth,
      scaleY: h / mdtHeight,
      rotate: rotate ? -rotate : undefined,
    },
  ]),
)
