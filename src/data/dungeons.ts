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

const cm: Dungeon = {
  name: 'Cinderbrew Meadery',
  key: 'cm',
  icon: 'inv_achievement_dungeon_cinderbrewmeadery',
  // wclEncounterId: TODO,
  ...dungeonData('cm'),
}

const dc: Dungeon = {
  name: 'Darkflame Crest',
  key: 'dc',
  icon: 'inv_achievement_dungeon_darkflamecleft',
  // wclEncounterId: TODO,
  ...dungeonData('dc'),
}

const mw: Dungeon = {
  name: 'Mechagon: Workshop',
  key: 'mw',
  icon: 'achievement_boss_mechagon',
  // wclEncounterId: TODO,
  ...dungeonData('mw'),
}

const of: Dungeon = {
  name: 'Operation: Floodgate',
  key: 'of',
  icon: 'inv_achievement_dungeon_waterworks',
  // wclEncounterId: TODO,
  ...dungeonData('of'),
}

const psf: Dungeon = {
  name: 'Priory of the Sacred Flame',
  key: 'psf',
  icon: 'inv_achievement_dungeon_prioryofthesacredflame',
  // wclEncounterId: TODO,
  ...dungeonData('psf'),
}

const tm: Dungeon = {
  name: 'The Motherlode',
  key: 'tm',
  icon: 'achievement_dungeon_kezan',
  // wclEncounterId: TODO,
  ...dungeonData('tm'),
}

const tr: Dungeon = {
  name: 'The Rookery',
  key: 'tr',
  icon: 'inv_achievement_dungeon_rookery',
  // wclEncounterId: TODO,
  ...dungeonData('tr'),
}

const top: Dungeon = {
  name: 'Theater of Pain',
  key: 'top',
  icon: 'achievement_dungeon_theatreofpain',
  wclEncounterId: 12293,
  ...dungeonData('top'),
}

export const dungeons = [cm, dc, mw, of, psf, tm, tr, top]

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
