export type Dungeon = {
  zoneId: number
  key: DungeonKey
  mdtMobs: Mob[]
}

export type DungeonKey = 'vp'

export type Spawn = {
  group: number | null
  spawnIndex: number
  pos: [number, number]
}

export type Mob = {
  id: number
  enemyIndex: number
  name: string
  count: number
  health: number
  creatureType: string
  scale: number
  spawns: Spawn[]
}

export type MobSpawn = {
  mob: Mob
  spawn: Spawn
}
