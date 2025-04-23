import type { Point } from '../data/types.ts'

export const roundTo = (number: number, to: number) => Math.round(number * 10 ** to) / 10 ** to

export function mobCountPercentStr(count: number, totalCount: number) {
  const percent = (count / totalCount) * 100
  return `${roundTo(percent, 2).toFixed(2).toLocaleString()}%`
}

export const distance = (a: Point, b: Point) => Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2)

export function formatNumber(number: number) {
  return number.toLocaleString('en-US')
}

export function shortRoundedNumber(number: number) {
  const absNumber = Math.abs(number)
  if (absNumber <= 9_999) return formatNumber(Math.round(number))
  if (absNumber <= 999_999) return `${formatNumber(Math.round(number / 1_000))}K`
  return `${formatNumber(roundTo(number / 1_000_000, 2))}M`
}
