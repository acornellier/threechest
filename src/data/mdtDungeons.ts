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
import { DungeonKey, MdtDungeon, MdtDungeonFake, MobSpawn, SpawnId } from './types.ts'
import { mdtEnemiesToMobSpawns } from '../util/mobSpawns.ts'

const mdtDungeonsFake: Record<DungeonKey, MdtDungeonFake> = {
  aa: aaMdtData,
  ad: adMdtData,
  bh: bhMdtData,
  brh: brhMdtData,
  dht: dhtMdtData,
  fall: fallMdtData,
  nok: nokMdtData,
  rise: riseMdtData,
  eb: ebMdtData,
  tott: tottMdtData,
  wcm: wcmMdtData,
}

export const mdtDungeons = mdtDungeonsFake as Record<DungeonKey, MdtDungeon>

export const mdtMobSpawns: Record<DungeonKey, Record<SpawnId, MobSpawn>> = Object.entries(
  mdtDungeons,
).reduce(
  (acc, [key, mdtDungeon]) => {
    acc[key as DungeonKey] = mdtEnemiesToMobSpawns(mdtDungeon.enemies)
    return acc
  },
  {} as Record<DungeonKey, Record<SpawnId, MobSpawn>>,
)
