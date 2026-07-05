export const dungeonKeys = ['fang', 'kr', 'murd', 'nalo', 'rlp', 'tos', 'vale', 'void'] as const

export type DungeonKey = (typeof dungeonKeys)[number]
