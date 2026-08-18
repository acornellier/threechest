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
    key: 'murd' as DungeonKey,
    name: 'Murder Row',
    icon: 'inv_achievement_dungeon_murderrow',
    wclEncounterId: 12813,
  },
  {
    key: 'nalo' as DungeonKey,
    name: 'Den of Nalorakk',
    icon: 'inv_achievement_dungeon_proveyourworth',
    wclEncounterId: 12825,
  },
  {
    key: 'vale' as DungeonKey,
    name: 'The Blinding Vale',
    icon: 'inv_achievement_dungeon_lightbloom',
    wclEncounterId: 12859,
  },
  {
    key: 'void' as DungeonKey,
    name: 'Voidscar Arena',
    icon: 'inv_achievement_dungeon_voidscararena',
    wclEncounterId: 12923,
  },
  {
    key: 'fang' as DungeonKey,
    name: 'Altar of Fangs',
    icon: 'inv_achievement_dungeon_altaroffangs',
    wclEncounterId: 12993,
  },
  {
    key: 'rlp' as DungeonKey,
    name: 'Ruby Life Pools',
    icon: 'achievement_dungeon_lifepools',
    wclEncounterId: 112521,
  },
  {
    key: 'tos' as DungeonKey,
    name: 'Temple of Sethraliss',
    icon: 'achievement_dungeon_templeofsethraliss',
    wclEncounterId: 61877,
  },
  {
    key: 'kr' as DungeonKey,
    name: "Kings' Rest",
    icon: 'achievement_dungeon_kingsrest',
    wclEncounterId: 61762,
  },
].map<Dungeon>((dungeon) => ({
  ...dungeon,
  ...dungeonData(dungeon.key),
}))

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
