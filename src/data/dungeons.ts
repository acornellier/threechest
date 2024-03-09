import { Dungeon, DungeonKey, MdtDungeon, Spells } from './types.ts'
import adMdtData from './mdtDungeons/ad_mdt.json'
import brhMdtData from './mdtDungeons/brh_mdt.json'
import dhtMdtData from './mdtDungeons/dht_mdt.json'
import fallMdtData from './mdtDungeons/fall_mdt.json'
import riseMdtData from './mdtDungeons/rise_mdt.json'
import ebMdtData from './mdtDungeons/eb_mdt.json'
import tottMdtData from './mdtDungeons/tott_mdt.json'
import wcmMdtData from './mdtDungeons/wcm_mdt.json'
import { adSpells } from './spells/adSpells.ts'
import { ebSpells } from './spells/ebSpells.ts'
import { brhSpells } from './spells/brhSpells.ts'
import { dhtSpells } from './spells/dhtSpells.ts'
import { fallSpells } from './spells/fallSpells.ts'
import { riseSpells } from './spells/riseSpells.ts'
import { tottSpells } from './spells/tottSpells.ts'
import { wcmSpells } from './spells/wcmSpells.ts'

export const ad: Dungeon = {
  name: "Atal'Dazar",
  key: 'ad',
  defaultZoom: 2.2,
  defaultOffset: [0, 0],
  mdt: adMdtData as MdtDungeon,
  spells: adSpells,
  icon: 'achievement_dungeon_ataldazar',
}

export const brh: Dungeon = {
  name: 'Black Rook Hold',
  key: 'brh',
  defaultZoom: 2,
  defaultOffset: [0, -30],
  mdt: brhMdtData as MdtDungeon,
  spells: brhSpells,
  icon: 'achievement_dungeon_blackrookhold',
}

export const dht: Dungeon = {
  name: 'Darkheart Thicket',
  key: 'dht',
  defaultZoom: 2.1,
  defaultOffset: [0, -40],
  mdt: dhtMdtData as MdtDungeon,
  spells: dhtSpells,
  icon: 'achievement_dungeon_darkheartthicket',
}

export const fall: Dungeon = {
  name: 'DOTI: Fall of Galakrond',
  key: 'fall',
  defaultZoom: 2,
  defaultOffset: [0, 0],
  mdt: fallMdtData as MdtDungeon,
  spells: fallSpells,
  icon: 'achievement_dungeon_dawnoftheinfinite',
}

export const eb: Dungeon = {
  name: 'Everbloom',
  key: 'eb',
  defaultZoom: 2.7,
  defaultOffset: [25, 10],
  mdt: ebMdtData as MdtDungeon,
  spells: ebSpells as Spells,
  icon: 'achievement_dungeon_everbloom',
}

export const rise: Dungeon = {
  name: "DOTI: Murozond's Rise",
  key: 'rise',
  defaultZoom: 1.9,
  defaultOffset: [0, -50],
  mdt: riseMdtData as MdtDungeon,
  spells: riseSpells,
  icon: 'achievement_dungeon_dawnoftheinfinite',
}

export const tott: Dungeon = {
  name: 'Throne of the Tides',
  key: 'tott',
  defaultZoom: 2,
  defaultOffset: [0, 0],
  mdt: tottMdtData as MdtDungeon,
  spells: tottSpells,
  icon: 'achievement_dungeon_throne-of-the-tides',
}

export const wcm: Dungeon = {
  name: 'Waycrest Manor',
  key: 'wcm',
  defaultZoom: 2,
  defaultOffset: [0, 0],
  mdt: wcmMdtData as MdtDungeon,
  spells: wcmSpells,
  icon: 'achievement_dungeon_waycrestmannor',
}

export const dungeons = [ad, brh, dht, eb, fall, rise, tott, wcm]

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
