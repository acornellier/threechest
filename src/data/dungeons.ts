import type { Dungeon } from './types.ts'
import { mapHeight, mapWidth } from '../util/map.ts'
import type { DungeonKey } from './dungeonKeys.ts'
import { mdtDungeons, mdtMobSpawns } from './mdtDungeons.ts'

export const dungeonData = (
  key: DungeonKey,
): Pick<Dungeon, 'mdt' | 'mobSpawns' | 'mobSpawnsList'> => ({
  mdt: mdtDungeons[key],
  mobSpawns: mdtMobSpawns[key],
  mobSpawnsList: Object.values(mdtMobSpawns[key]),
})

const aa: Dungeon = {
  name: 'Algethar Academy',
  key: 'aa',
  icon: 'achievement_dungeon_dragonacademy',
  wclEncounterId: 62526,
  defaultBounds: [
    [10, 0],
    [-mapHeight, mapWidth],
  ],
  ...dungeonData('aa'),
}

const av: Dungeon = {
  name: 'Azure Vault',
  key: 'av',
  icon: 'achievement_dungeon_arcanevaults',
  wclEncounterId: 62515,
  ...dungeonData('av'),
}

const bh: Dungeon = {
  name: 'Brackenhide Hollow (WIP!)',
  key: 'bh',
  icon: 'achievement_dungeon_brackenhidehollow',
  // wclEncounterId: 62520,
  ...dungeonData('bh'),
}

const hoi: Dungeon = {
  name: 'Halls of Infusion',
  key: 'hoi',
  icon: 'achievement_dungeon_hallsofinfusion',
  wclEncounterId: 62527,
  ...dungeonData('hoi'),
}

const nelth: Dungeon = {
  name: 'Neltharus',
  key: 'nelth',
  icon: 'achievement_dungeon_neltharus',
  wclEncounterId: 62519,
  ...dungeonData('nelth'),
}

const nok: Dungeon = {
  name: 'Nokhud Offensive',
  key: 'nok',
  icon: 'achievement_dungeon_centaurplains',
  wclEncounterId: 62516,
  ...dungeonData('nok'),
}

const rlp: Dungeon = {
  name: 'Ruby Life Pools',
  key: 'rlp',
  icon: 'achievement_dungeon_lifepools',
  wclEncounterId: 62521,
  defaultBounds: [
    [10, 0],
    [-mapHeight, mapWidth],
  ],
  ...dungeonData('rlp'),
}

const uld: Dungeon = {
  name: 'Uldaman',
  key: 'uld',
  icon: 'achievement_dungeon_uldaman',
  wclEncounterId: 62451,
  ...dungeonData('uld'),
}

export const dungeons = [aa, av, bh, hoi, nelth, nok, rlp, uld]

export const dungeonsByKey = dungeons.reduce(
  (acc, dungeon) => {
    acc[dungeon.key] = dungeon
    return acc
  },
  {} as Record<DungeonKey, Dungeon>,
)

export const dungeonsByMdtIdx = dungeons.reduce(
  (acc, dungeon) => {
    acc[dungeon.mdt.dungeonIndex] = dungeon
    return acc
  },
  {} as Record<number, Dungeon>,
)
