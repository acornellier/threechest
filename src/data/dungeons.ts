import { Dungeon, DungeonKey, MdtDungeon } from './types.ts'
import dotiuMdtData from './mdtDungeons/dotiu_mdt.json'
import ebMdtData from './mdtDungeons/eb_mdt.json'

export const dotiu: Dungeon = {
  name: "DOTI: Murozond's Rise",
  key: 'dotiu',
  defaultZoom: 1.9,
  defaultOffset: [10, -15],
  mdt: dotiuMdtData as MdtDungeon,
  icon: 'achievement_dungeon_dawnoftheinfinite',
}

export const eb: Dungeon = {
  name: 'Everbloom',
  key: 'eb',
  defaultZoom: 2.7,
  defaultOffset: [25, 10],
  mdt: ebMdtData as MdtDungeon,
  icon: 'achievement_dungeon_everbloom',
}

export const dungeons = [dotiu, eb]

export const dungeonsByKey = dungeons.reduce(
  (acc, dungeon) => {
    acc[dungeon.key] = dungeon
    return acc
  },
  {} as Record<DungeonKey, Dungeon>,
)
