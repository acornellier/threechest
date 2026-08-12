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
// 7. Check your work with `yarn offsets` — it measures how far WCL events land from the spawn
//    they belong to. Hand-aligned maps score a median of 2.5-12.5; a missing entry scores 57+.
// rotation: negative rotation
// Scale is always uniform: w/h must come out to 3840/2560 = 1.5. If it doesn't, the alignment
// is off rather than the map being stretched.
// Returning dungeons may already have values in git history — recover and verify with
// `yarn offsets` instead of redoing them (rlp's below came from cef9b328, still accurate).
const rawMdtMapOffsets: Record<
  number,
  { x: number; y: number; w: number; h: number; rotate?: number }
> = {
  // fang
  2588: {
    w: 3669,
    h: 2446,
    x: -1191,
    y: 0,
  },
  2589: {
    w: 2840,
    h: 1896,
    x: 227,
    y: 765,
  },
  2590: {
    w: 3420,
    h: 2280,
    x: 1346,
    y: 184,
  },
  // kr
  1004: {
    w: 4476,
    h: 2984,
    x: -331,
    y: -96,
  },
  // murd
  2433: {
    w: 2904,
    h: 1936,
    x: 1655,
    y: 649,
  },
  2434: {
    w: 5004,
    h: 3336,
    x: -1485,
    y: -461,
  },
  2435: {
    w: 2848,
    h: 1900,
    x: 1079,
    y: -1,
  },
  // nalo
  2513: {
    w: 1852,
    h: 1236,
    x: 2166,
    y: 169,
  },
  2514: {
    w: 3824,
    h: 2548,
    x: -570,
    y: 44,
  },
  // rlp
  2094: {
    w: 4405,
    h: 2938,
    x: 402,
    y: -187,
  },
  2095: {
    w: 3890,
    h: 2594,
    x: -1142,
    y: 262,
    rotate: -8,
  },
  // tos
  1038: {
    w: 4056,
    h: 2704,
    x: 464,
    y: -159,
  },
  1043: {
    w: 2644,
    h: 1764,
    x: -578,
    y: 157,
  },
  // vale
  2500: {
    w: 5124,
    h: 3416,
    x: -902,
    y: -387,
  },
  // void
  2572: {
    w: 2244,
    h: 1496,
    x: -175,
    y: 39,
  },
  2573: {
    w: 3656,
    h: 2436,
    x: 1162,
    y: 124,
  },
  2574: {
    w: 2196,
    h: 1464,
    x: -173,
    y: 1241,
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
