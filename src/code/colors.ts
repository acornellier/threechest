export function hsvToRgb(h: number, s: number, v: number) {
  h %= 361

  function f(n: number) {
    const k = (n + h / 60) % 6
    return v - v * s * Math.max(Math.min(k, 4 - k, 1), 0)
  }

  return [f(5), f(3), f(1)]
}

export const rgbToHex = (r: number, g: number, b: number) =>
  '#' +
  [r, g, b]
    .map((x) => {
      const hex = x.toString(16)
      return hex.length === 1 ? '0' + hex : hex
    })
    .join('')

const highContrastColors = [
  [1, 0.2446, 1],
  [0.2446, 1.0, 0.6223],
  [1.0, 0.2446, 0.2446],
  [0.2446, 0.6223, 1],
  [1.0, 0.98741, 0.2446],
  [0.2446, 1.0, 0.2446],
  [1.0, 0.2446, 0.6223],
  [0.2446, 1.0, 1],
  [1.0, 0.60971, 0.2446],
  [0.2446, 0.2446, 1],
  [0.63489, 1.0, 0.2446],
].map(([r, g, b]) => rgbToHex(Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)))

console.log(highContrastColors)

export function getPullColor(pullIndex: number) {
  return highContrastColors[pullIndex % highContrastColors.length]
}

// matches MDT colors
export function GetPullColorOld(pullIndex: number) {
  const h = ((pullIndex - 1) * 360) / 12 + 120
  const [r, g, b] = hsvToRgb(h, 0.7554, 1)
  return rgbToHex(Math.round(r * 255), Math.round(g * 255), Math.round(b * 255))
}
