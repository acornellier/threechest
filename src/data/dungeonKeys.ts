export const dungeonKeys = ['ak', 'cot', 'db', 'gb', 'mot', 'nw', 'sob', 'sv'] as const

export type DungeonKey = (typeof dungeonKeys)[number]
