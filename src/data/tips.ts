import { isMac } from '../util/dev.ts'

export interface Tip {
  id: number
  tip: string
}

export const pageVisitsKey = 'tips:pageVists'
export const tipsSeenKey = 'tips:tipsSeen'
export const neverShowTipsKey = 'tips:neverShowTips'

export function getTipsSeen(): number[] {
  const tipsSeenItem = localStorage.getItem(tipsSeenKey)
  const tipsSeen = tipsSeenItem ? JSON.parse(tipsSeenItem) : []
  return Array.isArray(tipsSeen) ? tipsSeen : []
}

export function neverShowTips() {
  localStorage.setItem(neverShowTipsKey, 'true')
}

export const tips: Tip[] = [
  { id: 0, tip: 'Hold shift then drag to select many mobs at once' },
  { id: 1, tip: `Hold ${isMac ? 'cmd' : 'ctrl'} then click to select invidual mobs` },
  { id: 2, tip: `Click Help in the bottom right to view all available shortcuts` },
  { id: 3, tip: `Join the discord in the bottom right` },
  { id: 4, tip: `Hold shift to view total forces instead of percent` },
]
