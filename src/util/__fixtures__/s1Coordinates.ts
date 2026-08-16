// Season 1 coordinate tables, snapshotted for the wclCalc regression tests.
//
// Both live tables were regenerated for the current season — mapBounds in 'update map bounds'
// (22a934c3) and mdtMapOffsets in 'new mdt map offsets' (ccf554b92) — and neither kept the S1
// map ids. Without them every S1 fixture event loses its position, so the pull matching falls
// back to composition alone and the snapshots drift. These are recovered copies of the entries
// as they were when those fixtures were captured, restored by wclCalc.test.ts the same way
// s1Dungeons restores the S1 mob data.

import type { MapOffset } from '../../data/coordinates/mdtMapOffsets.ts'
import type { MapBoundsByUiMapId } from '../../data/coordinates/mapBoundsUncompiled.ts'

export const s1MapBounds: MapBoundsByUiMapId = {
  184: {
    yMin: 233.33332824707,
    yMax: 1256.25,
    xMin: -839.58331298828,
    xMax: 693.75,
  },
  601: {
    yMin: 839.65197753906,
    yMax: 1367.9899902344,
    xMin: -2227.1235351562,
    xMax: -1434.6165771484,
  },
  602: {
    yMin: 941.31896972656,
    yMax: 1166.3199462891,
    xMin: -1945.8707275391,
    xMax: -1608.3692626953,
  },
  903: {
    yMin: 5275,
    yMax: 6304.169921875,
    xMin: -11156.299804688,
    xMax: -9612.5,
  },
  2097: {
    yMin: 1314.5799560547,
    yMax: 2093.75,
    xMin: 2429.169921875,
    xMax: 3597.919921875,
  },
  2098: {
    yMin: 2002.0799560547,
    yMax: 2587.5,
    xMin: 2637.5,
    xMax: 3514.8500976562,
  },
  2099: {
    yMin: 1405,
    yMax: 1565,
    xMin: 3067.5,
    xMax: 3307.5,
  },
  2492: {
    yMin: 5070,
    yMax: 5385,
    xMin: 2843.75,
    xMax: 3316.25,
  },
  2493: {
    yMin: 5200,
    yMax: 5380,
    xMin: 3030,
    xMax: 3300,
  },
  2494: {
    yMin: 5200,
    yMax: 5440,
    xMin: 3007.5,
    xMax: 3367.5,
  },
  2496: {
    yMin: 5063,
    yMax: 5240,
    xMin: 3029.75,
    xMax: 3295.25,
  },
  2497: {
    yMin: 5017.9985351562,
    yMax: 5248.3315429688,
    xMin: 2979.75,
    xMax: 3325.25,
  },
  2498: {
    yMin: 5112.9165039062,
    yMax: 5327.0834960938,
    xMin: 2890,
    xMax: 3211.25,
  },
  2499: {
    yMin: 5170,
    yMax: 5270,
    xMin: 3036.5,
    xMax: 3186.5,
  },
  2501: {
    yMin: -1262.5,
    yMax: -160.416015625,
    xMin: -1027.0830078125,
    xMax: 625,
  },
  2511: {
    yMin: 11216.666015625,
    yMax: 11845.833007812,
    xMin: 4600,
    xMax: 5543.75,
  },
  2515: {
    yMin: 11435,
    yMax: 11675,
    xMin: 4795,
    xMax: 5155,
  },
  2516: {
    yMin: 11584.997070312,
    yMax: 11766.703125,
    xMin: 5068.080078125,
    xMax: 5340.6401367188,
  },
  2517: {
    yMin: 11308.299804688,
    yMax: 11436.700195312,
    xMin: 4971.1997070312,
    xMax: 5163.8002929688,
  },
  2518: {
    yMin: 11315,
    yMax: 11385,
    xMin: 5047.5,
    xMax: 5152.5,
  },
  2519: {
    yMin: 11290.666992188,
    yMax: 11415.333007812,
    xMin: 5003,
    xMax: 5190,
  },
  2520: {
    yMin: 11301.296875,
    yMax: 11418.002929688,
    xMin: 5012.4702148438,
    xMax: 5187.5297851562,
  },
  2556: {
    yMin: 20,
    yMax: 670,
    xMin: -805,
    xMax: 170,
  },
}

// 25112511 / 25162516 are the synthetic post-transition ids from wclCalc's mapTransitions.
export const s1MdtMapOffsets: Record<number, MapOffset> = {
  184: {
    x: -0.16875,
    y: -0.036328125,
    scaleX: 1.2010416666666666,
    scaleY: 1.2015625,
  },
  601: {
    x: -0.35234375,
    y: -0.0734375,
    scaleX: 1.1802083333333333,
    scaleY: 1.18125,
  },
  602: {
    x: 0.36354166666666665,
    y: 0.156640625,
    scaleX: 0.8083333333333333,
    scaleY: 0.8078125,
  },
  903: {
    x: -0.05390625,
    y: -0.08125,
    scaleX: 1.1270833333333334,
    scaleY: 1.128125,
  },
  2097: {
    x: -0.015364583333333333,
    y: 0.1234375,
    scaleX: 1.0872395833333333,
    scaleY: 1.087109375,
  },
  2098: {
    x: 0.41119791666666666,
    y: -0.062890625,
    scaleX: 0.425,
    scaleY: 0.425,
  },
  2492: {
    x: -0.10885416666666667,
    y: 0.023046875,
    scaleX: 0.5239583333333333,
    scaleY: 0.5234375,
  },
  2493: {
    x: 0.13697916666666668,
    y: 0.05546875,
    scaleX: 0.47604166666666664,
    scaleY: 0.4765625,
  },
  2494: {
    x: 0.36354166666666665,
    y: 0.00703125,
    scaleX: 0.5083333333333333,
    scaleY: 0.509375,
  },
  2496: {
    x: -0.11953125,
    y: 0.47109375,
    scaleX: 0.5291666666666667,
    scaleY: 0.5296875,
  },
  2497: {
    x: 0.08828125,
    y: 0.458203125,
    scaleX: 0.5166666666666667,
    scaleY: 0.5171875,
  },
  2498: {
    x: 0.4328125,
    y: 0.608203125,
    scaleX: 0.36666666666666664,
    scaleY: 0.3671875,
  },
  2499: {
    x: 0.5276041666666667,
    y: 0.26875,
    scaleX: 0.5197916666666667,
    scaleY: 0.5203125,
  },
  2501: {
    x: -0.16744791666666667,
    y: -0.18671875,
    scaleX: 1.2416666666666667,
    scaleY: 1.2421875,
  },
  2511: {
    x: 0.17526041666666667,
    y: -0.0734375,
    scaleX: 0.7135416666666666,
    scaleY: 0.7140625,
    rotate: -60,
  },
  2515: {
    x: -0.0703125,
    y: 0.087109375,
    scaleX: 0.48020833333333335,
    scaleY: 0.48125,
    rotate: 120,
  },
  2516: {
    x: 0.615625,
    y: 0.051171875,
    scaleX: 0.43020833333333336,
    scaleY: 0.43125,
    rotate: -75,
  },
  2517: {
    x: 0.13151041666666666,
    y: 0.696484375,
    scaleX: 0.40625,
    scaleY: 0.40625,
    rotate: -155,
  },
  2518: {
    x: 0.21901041666666668,
    y: 0.51484375,
    scaleX: 0.2609375,
    scaleY: 0.2609375,
  },
  2519: {
    x: 0.04348958333333333,
    y: 0.4671875,
    scaleX: 0.2520833333333333,
    scaleY: 0.2515625,
  },
  2556: {
    x: 0,
    y: 0,
    scaleX: 0.99375,
    scaleY: 0.99375,
  },
  25112511: {
    x: 0.38671875,
    y: 0.37734375,
    scaleX: 0.7135416666666666,
    scaleY: 0.7140625,
    rotate: -60,
  },
  25162516: {
    x: 0.6872395833333333,
    y: 0.12421875,
    scaleX: 0.43020833333333336,
    scaleY: 0.43125,
    rotate: 60,
  },
}
