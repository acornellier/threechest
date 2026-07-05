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

// wclEncounterId values are the PTR (S2_PTR) encounter ids, for the `ptr` branch.
// Switch each to its `// live:` id when merging to the live S2 season.
export const dungeons: Dungeon[] = [
  {
    key: 'murd' as DungeonKey,
    name: 'Murder Row',
    icon: 'inv_achievement_dungeon_murderrow',
    wclEncounterId: 62813, // live: 12813
  },
  {
    key: 'nalo' as DungeonKey,
    name: 'Den of Nalorakk',
    icon: 'inv_achievement_dungeon_proveyourworth',
    wclEncounterId: 62825, // live: 12825
  },
  {
    key: 'vale' as DungeonKey,
    name: 'The Blinding Vale',
    icon: 'inv_achievement_dungeon_lightbloom',
    wclEncounterId: 62859, // live: 12859
  },
  {
    key: 'void' as DungeonKey,
    name: 'Voidscar Arena',
    icon: 'inv_achievement_dungeon_voidscararena',
    wclEncounterId: 62923, // live: 12923
  },
  {
    key: 'fang' as DungeonKey,
    name: 'Altar of Fangs',
    icon: 'inv_achievement_dungeon_altaroffangs',
    wclEncounterId: 62993, // live: 12993
  },
  {
    key: 'rlp' as DungeonKey,
    name: 'Ruby Life Pools',
    icon: 'achievement_dungeon_lifepools',
    wclEncounterId: 162521, // live: 112521
  },
  {
    key: 'tos' as DungeonKey,
    name: 'Temple of Sethraliss',
    icon: 'achievement_dungeon_templeofsethraliss',
    wclEncounterId: 111877, // live: 61877
  },
  {
    key: 'kr' as DungeonKey,
    name: "Kings' Rest",
    icon: 'achievement_dungeon_kingsrest',
    wclEncounterId: 111762, // live: 61762
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
