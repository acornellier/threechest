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
    key: 'magi' as DungeonKey,
    name: "Magister's Terrace",
    icon: 'inv_achievement_dungeon_magistersterrace',
  },
  {
    key: 'cavns' as DungeonKey,
    name: 'Maisara Caverns',
    icon: 'inv_achievement_dungeon_maisarahills',
  },
  {
    key: 'xenas' as DungeonKey,
    name: 'Nexus-Point Xenas',
    icon: 'inv_achievement_dungeon_nexuspointxenas',
  },
  {
    key: 'wind' as DungeonKey,
    name: 'Windrunner Spire',
    icon: 'inv_achievement_dungeon_windrunnerspire',
  },
  {
    key: 'aa' as DungeonKey,
    name: "Algeth'ar Academy",
    icon: 'achievement_dungeon_dragonacademy',
  },
  {
    key: 'pit' as DungeonKey,
    name: 'Pit of Saron',
    icon: 'achievement_dungeon_icecrown_pitofsaron',
  },
  {
    key: 'seat' as DungeonKey,
    name: 'Seat of the Triumvirate',
    icon: 'achievement_dungeon_argusdungeon',
  },
  {
    key: 'sky' as DungeonKey,
    name: 'Skyreach',
    icon: 'achievement_dungeon_arakkoaspires',
  },
]
  .map<Dungeon>((dungeon) => ({
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
