import { Dungeon, DungeonKey, MdtDungeon, Mob, Spells } from './types.ts'
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
import { mdtEnemiesToMobSpawns } from '../util/mobSpawns.ts'

export const mapHeight = 256
export const mapWidth = 384

export const ad: Dungeon = {
  name: "Atal'Dazar",
  key: 'ad',
  defaultBounds: [
    [0, 110],
    [-240, 330],
  ],
  mdt: adMdtData as MdtDungeon,
  mobSpawns: mdtEnemiesToMobSpawns(adMdtData.enemies as Mob[]),
  spells: adSpells,
  icon: 'achievement_dungeon_ataldazar',
}

export const brh: Dungeon = {
  name: 'Black Rook Hold',
  key: 'brh',
  mdt: brhMdtData as MdtDungeon,
  mobSpawns: mdtEnemiesToMobSpawns(brhMdtData.enemies as Mob[]),
  spells: brhSpells,
  icon: 'achievement_dungeon_blackrookhold',
}

export const dht: Dungeon = {
  name: 'Darkheart Thicket',
  key: 'dht',
  defaultBounds: [
    [-20, 46],
    [-242, 346],
  ],
  mdt: dhtMdtData as MdtDungeon,
  mobSpawns: mdtEnemiesToMobSpawns(dhtMdtData.enemies as Mob[]),
  spells: dhtSpells,
  icon: 'achievement_dungeon_darkheartthicket',
}

export const eb: Dungeon = {
  name: 'Everbloom',
  key: 'eb',
  defaultBounds: [
    [-40, 145],
    [-180, 300],
  ],
  mdt: ebMdtData as MdtDungeon,
  mobSpawns: mdtEnemiesToMobSpawns(ebMdtData.enemies as Mob[]),
  spells: ebSpells as Spells,
  icon: 'achievement_dungeon_everbloom',
}

export const fall: Dungeon = {
  name: 'DOTI: Fall of Galakrond',
  key: 'fall',
  defaultBounds: [
    [-10, 50],
    [-mapHeight, 350],
  ],
  mdt: fallMdtData as MdtDungeon,
  mobSpawns: mdtEnemiesToMobSpawns(fallMdtData.enemies as Mob[]),
  spells: fallSpells,
  icon: 'achievement_dungeon_dawnoftheinfinite',
}

export const rise: Dungeon = {
  name: "DOTI: Murozond's Rise",
  key: 'rise',
  defaultBounds: [
    [-10, 50],
    [-mapHeight, 350],
  ],
  mdt: riseMdtData as MdtDungeon,
  mobSpawns: mdtEnemiesToMobSpawns(riseMdtData.enemies as Mob[]),
  spells: riseSpells,
  icon: 'achievement_dungeon_dawnoftheinfinite',
}

export const tott: Dungeon = {
  name: 'Throne of the Tides',
  key: 'tott',
  defaultBounds: [
    [-20, 50],
    [-230, 340],
  ],
  mdt: tottMdtData as MdtDungeon,
  mobSpawns: mdtEnemiesToMobSpawns(tottMdtData.enemies as Mob[]),
  spells: tottSpells,
  icon: 'achievement_dungeon_throne-of-the-tides',
}

export const wcm: Dungeon = {
  name: 'Waycrest Manor',
  key: 'wcm',
  mdt: wcmMdtData as MdtDungeon,
  mobSpawns: mdtEnemiesToMobSpawns(wcmMdtData.enemies as Mob[]),
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
