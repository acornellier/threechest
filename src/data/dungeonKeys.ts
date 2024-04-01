export const dungeonKeys = [
  'aa',
  'av',
  'bh',
  'hoi',
  'nelth',
  'nok',
  'rlp',
  'uld',
  'brh',
  'dht',
  'fall',
  'rise',
  'ad',
  'eb',
  'tott',
  'wcm',
] as const

export type DungeonKey = (typeof dungeonKeys)[number]

export const isSeason4 = (key: DungeonKey) =>
  ['aa', 'av', 'bh', 'hoi', 'nelth', 'nok', 'rlp', 'uld'].includes(key)
