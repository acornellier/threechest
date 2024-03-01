export type MdtDungeon = {
  dungeonIndex: number
  totalCount: number
  enemies: Mob[]
}

export type Dungeon = {
  name: string
  key: DungeonKey
  mdt: MdtDungeon
  icon: string
}

export type DungeonKey = 'dotiu' | 'eb'

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
export type MobSpawnKey = string
