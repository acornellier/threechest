import type { Dungeon } from './types.ts'
import type { DungeonKey } from './dungeonKeys.ts'
import { mdtDungeons, mdtMobSpawns } from './mdtDungeons.ts'

export const dungeonData = (
  key: DungeonKey,
): Pick<Dungeon, 'mdt' | 'mobSpawns' | 'mobSpawnsList'> => ({
  mdt: mdtDungeons[key],
  mobSpawns: mdtMobSpawns[key],
  mobSpawnsList: Object.values(mdtMobSpawns[key]),
})

const ak: Dungeon = {
  name: 'Ara-Kara',
  key: 'ak',
  icon: 'inv_achievement_dungeon_arak-ara',
  wclEncounterId: 12660,
  ...dungeonData('ak'),
}

const cot: Dungeon = {
  name: 'City of Threads',
  key: 'cot',
  icon: 'inv_achievement_dungeon_cityofthreads',
  wclEncounterId: 12669,
  ...dungeonData('cot'),
}

const db: Dungeon = {
  name: 'Dawnbreaker',
  key: 'db',
  icon: 'inv_achievement_dungeon_dawnbreaker',
  // wclEncounterId: 12662,
  ...dungeonData('db'),
}

const gb: Dungeon = {
  name: 'Grim Batol',
  key: 'gb',
  icon: 'achievement_dungeon_grimbatol',
  wclEncounterId: 60670,
  ...dungeonData('gb'),
}

const mot: Dungeon = {
  name: 'Mists of Tirna Scithe',
  key: 'mot',
  icon: 'achievement_dungeon_mistsoftirnascithe',
  wclEncounterId: 62290,
  ...dungeonData('mot'),
}

const nw: Dungeon = {
  name: 'Necrotic Wake',
  key: 'nw',
  icon: 'achievement_dungeon_theneroticwake',
  ...dungeonData('nw'),
  wclEncounterId: 62286,
}

const sob: Dungeon = {
  name: 'Siege of Boralus',
  key: 'sob',
  icon: 'achievement_dungeon_siegeofboralus',
  wclEncounterId: 61822,
  ...dungeonData('sob'),
}

const sv: Dungeon = {
  name: 'Stonevault',
  key: 'sv',
  icon: 'inv_achievement_dungeon_stonevault',
  wclEncounterId: 12652,
  ...dungeonData('sv'),
}

export const dungeons = [ak, cot, db, gb, mot, nw, sob, sv]

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
