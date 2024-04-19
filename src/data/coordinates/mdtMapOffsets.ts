// top left corners

export interface MapOffset {
  x: number
  y: number
  scaleX: number
  scaleY: number
  rotate?: number
}

export const mdtMapOffsets: Record<number, MapOffset> = {
  // aa
  2097: {
    x: -1133 / 3840,
    y: -178 / 2560,
    scaleX: 4834 / 3840,
    scaleY: 3223 / 2560,
  },
  2098: {
    x: 697 / 3840,
    y: -512 / 2560,
    scaleX: 5244 / 3840,
    scaleY: 3496 / 2560,
  },

  // av
  2073: {
    x: -589 / 3840,
    y: -446 / 2560,
    scaleX: 3132 / 3840,
    scaleY: 2090 / 2560,
  },
  2074: {
    x: 1183 / 3840,
    y: -1030 / 2560,
    scaleX: 3357 / 3840,
    scaleY: 3217 / 2560,
    rotate: 39,
  },
  2075: {
    x: -192 / 3840,
    y: 929 / 2560,
    scaleX: 2319 / 3840,
    scaleY: 1546 / 2560,
  },
  2076: {
    x: 1576 / 3840,
    y: 1121 / 2560,
    scaleX: 2359 / 3840,
    scaleY: 1595 / 2560,
    rotate: 180,
  },
}
