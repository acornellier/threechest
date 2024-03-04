import { Dungeon, DungeonKey, MdtDungeon } from './types.ts'
import adMdtData from './mdtDungeons/ad_mdt.json'
import brhMdtData from './mdtDungeons/brh_mdt.json'
import dhtMdtData from './mdtDungeons/dht_mdt.json'
import dotilMdtData from './mdtDungeons/dotil_mdt.json'
import dotiuMdtData from './mdtDungeons/dotiu_mdt.json'
import ebMdtData from './mdtDungeons/eb_mdt.json'
import tottMdtData from './mdtDungeons/tott_mdt.json'
import wcmMdtData from './mdtDungeons/wcm_mdt.json'

export const ad: Dungeon = {
  name: "Atal'Dazar",
  key: 'ad',
  defaultZoom: 2,
  defaultOffset: [0, 0],
  mdt: adMdtData as MdtDungeon,
  icon: 'achievement_dungeon_ataldazar',
}

export const brh: Dungeon = {
  name: 'Black Rook Hold',
  key: 'brh',
  defaultZoom: 2,
  defaultOffset: [0, 0],
  mdt: brhMdtData as MdtDungeon,
  icon: 'achievement_dungeon_blackrookhold',
}

export const dht: Dungeon = {
  name: 'Darkheart Thicket',
  key: 'dht',
  defaultZoom: 2,
  defaultOffset: [0, 0],
  mdt: dhtMdtData as MdtDungeon,
  icon: 'achievement_dungeon_darkheartthicket',
}

export const dotil: Dungeon = {
  name: 'DOTI: Fall of Galakrond',
  key: 'dotil',
  defaultZoom: 2,
  defaultOffset: [0, 0],
  mdt: dotilMdtData as MdtDungeon,
  icon: 'achievement_dungeon_dawnoftheinfinite',
}

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

export const tott: Dungeon = {
  name: 'Throne of the Tides',
  key: 'tott',
  defaultZoom: 2,
  defaultOffset: [0, 0],
  mdt: tottMdtData as MdtDungeon,
  icon: 'achievement_dungeon_throne-of-the-tides',
}

export const wcm: Dungeon = {
  name: 'Waycrest Manor',
  key: 'wcm',
  defaultZoom: 2,
  defaultOffset: [0, 0],
  mdt: wcmMdtData as MdtDungeon,
  icon: 'achievement_dungeon_waycrestmannor',
}

export const dungeons = [ad, brh, dht, dotil, dotiu, eb, tott, wcm]

export const dungeonsByKey = dungeons.reduce(
  (acc, dungeon) => {
    acc[dungeon.key] = dungeon
    return acc
  },
  {} as Record<DungeonKey, Dungeon>,
)
