export const dungeonKeys = ['cm', 'dc', 'mw', 'of', 'psf', 'tm', 'tr', 'top'] as const

export type DungeonKey = (typeof dungeonKeys)[number]
