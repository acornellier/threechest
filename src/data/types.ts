export type Point = [number, number]

export type MdtDungeon = {
  dungeonIndex: number
  totalCount: number
  enemies: Mob[]
}

export type Dungeon = {
  key: DungeonKey
  name: string
  defaultBounds?: [Point, Point]
  mdt: MdtDungeon
  mobSpawns: Record<SpawnId, MobSpawn>
  mobSpawnsList: MobSpawn[]
  spells: Record<number, Spell[]>
  wclEncounterId?: number
  icon: string
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
}

export type Spells = Record<number, Spell[]>

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
