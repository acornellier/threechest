export const dungeonKeys = ['ak', 'db', 'eda', 'gmbt', 'hoa', 'of', 'psf', 'strt'] as const

export type DungeonKey = (typeof dungeonKeys)[number]
