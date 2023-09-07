export type Dungeon = {
  mdtMobs: MdtMob[]
}

export type Spawn = {
  pos: [number, number]
}

export type MdtMob = {
  id: number
  name: string
  count: number
  health: number
  creatureType: string
  spawns: Spawn[]
}
