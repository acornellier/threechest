export const dungeonKeys = ['mt', 'mc', 'npx', 'ws', 'aa', 'pos', 'sott', 'sr'] as const

export type DungeonKey = (typeof dungeonKeys)[number]
