export const dungeonKeys = ['magi', 'cavns', 'xenas', 'wind', 'aa', 'pit', 'seat', 'sky'] as const

export type DungeonKey = (typeof dungeonKeys)[number]
