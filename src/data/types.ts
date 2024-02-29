export type MdtDungeon = {
  dungeonIndex: number
  totalCount: number
  enemies: Mob[]
}

export type Dungeon = {
  key: DungeonKey
  mdt: MdtDungeon
}

export type DungeonKey = 'dotiu' | 'eb'

export type Spawn = {
  group: number | null
  spawnIndex: number
  pos: number[]
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
