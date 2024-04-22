export const dungeonKeys = ['aa', 'av', 'bh', 'hoi', 'nelth', 'nok', 'rlp', 'uld'] as const

export type DungeonKey = (typeof dungeonKeys)[number]
