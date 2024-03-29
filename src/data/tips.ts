import { isMac } from '../util/dev.ts'

export interface Tip {
  id: string
  tip: string
}

export const pageVisitsKey = 'tips:pageVists'
export const tipsSeenKey = 'tips:tipsSeen'
export const neverShowTipsKey = 'tips:neverShowTips'

export function getTipsSeen(): string[] {
  const tipsSeenItem = localStorage.getItem(tipsSeenKey)
  const tipsSeen = tipsSeenItem ? JSON.parse(tipsSeenItem) : []
  return Array.isArray(tipsSeen) ? tipsSeen : []
}

export function neverShowTips() {
  localStorage.setItem(neverShowTipsKey, 'true')
}

export const tips: Tip[] = [
  { id: 'shift-drag', tip: 'Hold shift then drag to select many mobs at once' },
  {
    id: 'select-individual-mobs',
    tip: `Hold ${isMac ? 'cmd' : 'ctrl'} then click to select invidual mobs`,
  },
  { id: 'help-button', tip: `Click Help in the bottom right to view all available shortcuts` },
  {
    id: 'note-howto',
    tip: `Right click on the map to create a note. Once placed, left click to edit it, or drag to move it around.`,
  },
  { id: 'discord', tip: `Join the discord in the bottom right with and suggestions or feedback` },
  { id: 'shift-forces-percent', tip: `Hold shift to view total forces instead of percent` },
]
