import type { DungeonKey } from './dungeonKeys.ts'

export type Point = [number, number] // [y, x]

export type MdtDungeon = {
  dungeonIndex: number
  totalCount: number
  enemies: Mob[]
  pois: PointOfInterest[]
}

export type Dungeon = {
  key: DungeonKey
  displayKey?: string
  name: string
  icon: string
  defaultBounds?: [Point, Point]
  mdt: MdtDungeon
  mobSpawns: Record<SpawnId, MobSpawn>
  mobSpawnsList: MobSpawn[]
  wclEncounterId?: number
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

export type MdtSpell = {
  id: number
  attributes: SpellAttribute[]
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
  spells: MdtSpell[]
  spawns: Spawn[]
}

export type MobSpawn = {
  mob: Mob
  spawn: Spawn
}

export type PointOfInterest = {
  type:
    | 'dungeonEntrance'
    | 'graveyard'
    | 'nwItem'
    | 'cityOfThreadsItem'
    | 'stonevaultItem'
    | 'mistsItem'
    | 'araKaraItem'
    | 'EDAItem1'
    | 'EDAItem2'
    | 'EDAItem3'
    | 'floodgateItem'
    | 'prioryItem'
  itemType: null | number
  pos: Point
}

export type Spell = {
  id: number
  name: string
  icon: string
  damage?: number
  aoe?: boolean
  physical?: boolean
  castTime?: number
  attributes?: SpellAttribute[]
}

export type Spells = Record<number, Spell[]>
export type SpellIdMap = Record<number, number[]>

export type SpellAttribute =
  | 'interruptible'
  | 'enrage'
  | 'bleed'
  | 'magic'
  | 'curse'
  | 'poison'
  | 'disease'
// | 'Purge'
// | 'Movement'

// Change [number, number] to number[] to type-check JSON
export type SpawnFake = Omit<Spawn, 'pos' | 'patrol'> & {
  pos: number[]
  patrol?: Array<number[]>
}

export type SpellFake = {
  id: number
  attributes: string[]
}

export type MobFake = Omit<Mob, 'spawns' | 'spells'> & {
  spawns: SpawnFake[]
  spells: SpellFake[]
}

export type PoiFake = Omit<PointOfInterest, 'type' | 'pos'> & {
  type: string
  pos: number[]
}

export type MdtDungeonFake = Omit<MdtDungeon, 'enemies' | 'pois'> & {
  enemies: MobFake[]
  pois: PoiFake[]
}
