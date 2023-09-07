export type Dungeon = {
  mdtMobs: MdtMob[]
}

export type Spawn = {
  group: number | null
  pos: [number, number]
}

export type MdtMob = {
  id: number
  name: string
  count: number
  health: number
  creatureType: string
  scale: number
  spawns: Spawn[]
}
