export const dungeonKeys = ['top'] as const

export type DungeonKey = (typeof dungeonKeys)[number]
