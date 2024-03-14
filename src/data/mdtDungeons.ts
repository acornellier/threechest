import aaMdtData from './mdtDungeons/aa_mdt.json'
import adMdtData from './mdtDungeons/ad_mdt.json'
import bhMdtData from './mdtDungeons/bh_mdt.json'
import brhMdtData from './mdtDungeons/brh_mdt.json'
import dhtMdtData from './mdtDungeons/dht_mdt.json'
import fallMdtData from './mdtDungeons/fall_mdt.json'
import riseMdtData from './mdtDungeons/rise_mdt.json'
import ebMdtData from './mdtDungeons/eb_mdt.json'
import nokMdtData from './mdtDungeons/nok_mdt.json'
import tottMdtData from './mdtDungeons/tott_mdt.json'
import wcmMdtData from './mdtDungeons/wcm_mdt.json'
import { DungeonKey, MdtDungeon, MobSpawn, SpawnId } from './types.ts'
import { mdtEnemiesToMobSpawns } from '../util/mobSpawns.ts'

export const mdtDungeons: Record<DungeonKey, MdtDungeon> = {
  aa: aaMdtData as MdtDungeon,
  ad: adMdtData as MdtDungeon,
  bh: bhMdtData as MdtDungeon,
  brh: brhMdtData as MdtDungeon,
  dht: dhtMdtData as MdtDungeon,
  fall: fallMdtData as MdtDungeon,
  nok: nokMdtData as MdtDungeon,
  rise: riseMdtData as MdtDungeon,
  eb: ebMdtData as MdtDungeon,
  tott: tottMdtData as MdtDungeon,
  wcm: wcmMdtData as MdtDungeon,
}

export const mdtMobSpawns: Record<DungeonKey, Record<SpawnId, MobSpawn>> = Object.entries(
  mdtDungeons,
).reduce(
  (acc, [key, mdtDungeon]) => {
    acc[key as DungeonKey] = mdtEnemiesToMobSpawns(mdtDungeon.enemies)
    return acc
  },
  {} as Record<DungeonKey, Record<SpawnId, MobSpawn>>,
)
