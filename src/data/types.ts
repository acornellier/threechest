import type { DungeonKey } from './dungeonKeys.ts'

export type Point = [number, number]

export type MdtDungeon = {
  dungeonIndex: number
  totalCount: number
  enemies: Mob[]
}

export type Dungeon = {
  name: string
  defaultBounds?: [Point, Point]
  key: DungeonKey
  mdt: MdtDungeon
  mobSpawns: Record<SpawnId, MobSpawn>
  mobSpawnsList: MobSpawn[]
  spells: Record<number, Spell[]>
  icon: string
}

export type SpawnId = string

export type Spawn = {
  id: SpawnId
  group: number | null
  idx: number
  pos: Point
  scale?: number | null
  patrol?: Array<Point>
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
  stealthDetect?: boolean
  characteristics: string[]
  spawns: Spawn[]
}

export type MobSpawn = {
  mob: Mob
  spawn: Spawn
}

export type Spell = {
  id: number
  name: string
  icon: string
  damage?: { s3: number; s4: number }
  aoe?: boolean
  physical?: boolean
  variance?: number
  dispel?: DispelType[]
  interrupt?: boolean
  stop?: boolean
}

export type Spells = Record<number, Spell[]>
export type SpellIdMap = Record<number, number[]>

export type DispelType =
  | 'Soothe'
  | 'Purge'
  | 'Bleed'
  | 'Magic'
  | 'Curse'
  | 'Poison'
  | 'Disease'
  | 'Movement'

// Change [number, number] to number[] to type-check JSON
export type SpawnFake = Omit<Spawn, 'pos' | 'patrol'> & {
  pos: number[]
  patrol?: Array<number[]>
}

export type MobFake = Omit<Mob, 'spawns'> & {
  spawns: SpawnFake[]
}

export type MdtDungeonFake = Omit<MdtDungeon, 'enemies'> & {
  enemies: MobFake[]
}
