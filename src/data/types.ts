import { LatLngTuple } from 'leaflet'

export type Point = [number, number]

export type MdtDungeon = {
  dungeonIndex: number
  totalCount: number
  enemies: Mob[]
}

export type Dungeon = {
  name: string
  defaultBounds?: [LatLngTuple, LatLngTuple]
  key: DungeonKey
  mdt: MdtDungeon
  mobSpawns: Record<SpawnId, MobSpawn>
  spells: Record<number, Spell[]>
  icon: string
  iconScaling?: number
}

export type DungeonKey =
  | 'aa'
  | 'ad'
  | 'bh'
  | 'brh'
  | 'dht'
  | 'fall'
  | 'nok'
  | 'rise'
  | 'eb'
  | 'tott'
  | 'wcm'

export type SpawnId = string

export type Spawn = {
  id: SpawnId
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

export type Spell = {
  id: number
  name: string
  icon: string
}

export type Spells = Record<number, Spell[]>
