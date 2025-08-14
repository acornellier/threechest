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

export const dungeons: Dungeon[] = [
  {
    key: 'ak' as DungeonKey,
    name: 'Ara-Kara',
    icon: 'inv_achievement_dungeon_arak-ara',
    wclEncounterId: 62660,
  },
  {
    key: 'db' as DungeonKey,
    name: 'Dawnbreaker',
    icon: 'inv_achievement_dungeon_dawnbreaker',
    // wclEncounterId: 62662,
  },
  {
    key: 'eda' as DungeonKey,
    name: "Eco-Dome Al'dani",
    icon: 'inv_112_achievement_dungeon_ecodome',
    wclEncounterId: 12830,
  },
  {
    key: 'gmbt' as DungeonKey,
    name: "So'leah's Gambit",
    icon: 'achievement_dungeon_brokerdungeon',
    wclEncounterId: 112442,
  },
  {
    key: 'hoa' as DungeonKey,
    name: 'Halls of Atonement',
    icon: 'achievement_dungeon_hallsofattonement',
    wclEncounterId: 62287,
  },
  {
    name: 'Operation: Floodgate',
    key: 'of' as DungeonKey,
    displayKey: 'flood',
    icon: 'inv_achievement_dungeon_waterworks',
    wclEncounterId: 62773,
  },
  {
    name: 'Priory',
    key: 'psf' as DungeonKey,
    displayKey: 'prio',
    icon: 'inv_achievement_dungeon_prioryofthesacredflame',
    wclEncounterId: 62649,
  },
  {
    name: 'Streets of Wonder',
    key: 'strt' as DungeonKey,
    icon: 'ability_brokerjazzband_trumpet',
    wclEncounterId: 112441,
  },
]
  .map((dungeon) => ({
    ...dungeon,
    ...dungeonData(dungeon.key),
  }))
  .sort((a, b) => (a.displayKey ?? a.key).localeCompare(b.displayKey ?? b.key))

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
