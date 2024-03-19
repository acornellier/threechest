export function lightenColor(color: string, amount: number) {
  return (
    '#' +
    color
      .replace(/^#/, '')
      .replace(/../g, (color) =>
        ('0' + Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).slice(-2),
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

function hexToRgb(hex: string): [number, number, number] | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return null

  return [parseInt(result[1]!, 16), parseInt(result[2]!, 16), parseInt(result[3]!, 16)]
}

export const rgbToHex = (r: number, g: number, b: number) =>
  '#' +
  [r, g, b]
    .map((v) => (v <= 1 ? Math.round(v * 255) : v))
    .map((x) => {
      const hex = x.toString(16)
      return hex.length === 1 ? '0' + hex : hex
    })
    .join('')

export const highContrastColors = (
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

export const darkHighContrastColors = highContrastColors.map((color) => darkenColor(color, 100))

export function getPullColor(pullIndex: number, dark?: boolean): string {
  const colors = dark ? darkHighContrastColors : highContrastColors
  return colors[pullIndex % colors.length]!
}

export function getTextColor(hex: string) {
  const rgb = hexToRgb(hex)
  if (rgb && rgb[0] * 0.299 + rgb[1] * 0.587 + rgb[2] * 0.114 > 150) {
    return 'black'
  } else {
    return 'white'
  }
}
