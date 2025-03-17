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
  wclEncounterId: 12661,
  ...dungeonData('cm'),
}

const dc: Dungeon = {
  name: 'Darkflame Cleft',
  key: 'dc',
  icon: 'inv_achievement_dungeon_darkflamecleft',
  wclEncounterId: 12651,
  ...dungeonData('dc'),
}

const mw: Dungeon = {
  name: 'Mechagon: Workshop',
  key: 'mw',
  icon: 'achievement_boss_mechagon',
  wclEncounterId: 112098,
  ...dungeonData('mw'),
}

const of: Dungeon = {
  name: 'Operation: Floodgate',
  key: 'of',
  icon: 'inv_achievement_dungeon_waterworks',
  wclEncounterId: 12773,
  ...dungeonData('of'),
}

const psf: Dungeon = {
  name: 'Priory of the Sacred Flame',
  key: 'psf',
  icon: 'inv_achievement_dungeon_prioryofthesacredflame',
  wclEncounterId: 12649,
  ...dungeonData('psf'),
}

const tm: Dungeon = {
  name: 'The MOTHERLODE!!',
  key: 'tm',
  displayKey: 'ml',
  icon: 'achievement_dungeon_kezan',
  wclEncounterId: 61594,
  ...dungeonData('tm'),
}

const tr: Dungeon = {
  name: 'The Rookery',
  key: 'tr',
  displayKey: 'rook',
  icon: 'inv_achievement_dungeon_rookery',
  wclEncounterId: 12648,
  ...dungeonData('tr'),
}

const top: Dungeon = {
  name: 'Theater of Pain',
  key: 'top',
  icon: 'achievement_dungeon_theatreofpain',
  wclEncounterId: 62293,
  ...dungeonData('top'),
}

export const dungeons = [cm, dc, mw, of, psf, tm, tr, top].sort((a, b) =>
  (a.displayKey ?? a.key).localeCompare(b.displayKey ?? b.key),
)

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
