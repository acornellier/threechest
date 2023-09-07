export type Dungeon = {
  zoneId: number
  key: DungeonKey
  mdtMobs: MdtMob[]
}

export type DungeonKey = 'vp'

export type Spawn = {
  group: number | null
  spawnIndex: number
  pos: [number, number]
}

export type MdtMob = {
  id: number
  enemyIndex: number
  name: string
  count: number
  health: number
  creatureType: string
  scale: number
  spawns: Spawn[]
}

// type MdtPull = Record<string, number[]> & {
//   color: string
// }

type MdtPullEnemy = {
  enemyIndex: number
  spawnIndexes: number[]
}

type MdtPull = {
  color: string
  enemies: MdtPullEnemy[]
}

export type MdtRoute = {
  text: string
  week: number
  difficulty: number
  uid: string
  addonVersion: number
  value: {
    currentPull: number
    currentSublevel: number
    currentDungeonIdx: number
    selection: number[]
    pulls: MdtPull[]
  }
}
