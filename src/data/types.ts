export type Point = [number, number]

export type MdtDungeon = {
  dungeonIndex: number
  totalCount: number
  enemies: Mob[]
}

export type Dungeon = {
  name: string
  defaultZoom: number
  defaultOffset: [number, number]
  key: DungeonKey
  mdt: MdtDungeon
  icon: string
}

export type DungeonKey = 'ad' | 'brh' | 'dht' | 'dotil' | 'dotiu' | 'eb' | 'tott' | 'wcm'

export type Spawn = {
  group: number | null
  spawnIndex: number
  pos: Point
  patrol: Array<Point>
}

export type Mob = {
  id: number
  enemyIndex: number
  name: string
  count: number
  health: number
  creatureType: string
  scale: number
  isBoss: boolean
  spawns: Spawn[]
}

export type MobSpawn = {
  mob: Mob
  spawn: Spawn
}
export type MobSpawnKey = string
