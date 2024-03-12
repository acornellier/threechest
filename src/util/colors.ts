export function lightenColor(color: string, amount: number) {
  return (
    '#' +
    color
      .replace(/^#/, '')
      .replace(/../g, (color) =>
        ('0' + Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).substring(-2),
      )
  )
}

export const darkenColor = (color: string, amount: number) => lightenColor(color, -amount)

export function hsvToRgb(h: number, s: number, v: number) {
  h %= 361

  function f(n: number) {
    const k = (n + h / 60) % 6
    return v - v * s * Math.max(Math.min(k, 4 - k, 1), 0)
  }

  return [f(5), f(3), f(1)] as const
}

export const rgbToHex = (r: number, g: number, b: number) =>
  '#' +
  [r, g, b]
    .map((v) => Math.round(v * 255))
    .map((x) => {
      const hex = x.toString(16)
      return hex.length === 1 ? '0' + hex : hex
    })
    .join('')

const highContrastColors = (
  [
    [1, 0.2446, 1],
    [0.2446, 1.0, 0.6223],
    [1.0, 0.2446, 0.2446],
    [0.2446, 0.7223, 1],
    [1.0, 0.98741, 0.2446],
    [0.2446, 1.0, 0.2446],
    [1.0, 0.2446, 0.6223],
    [0.2446, 1.0, 1],
    [1.0, 0.60971, 0.2446],
    [0.2446, 0.2446, 1],
    [0.63489, 1.0, 0.2446],
  ] as const
).map(([r, g, b]) => rgbToHex(r, g, b))

export function getPullColor(pullIndex: number) {
  return highContrastColors[pullIndex % highContrastColors.length]!
}
