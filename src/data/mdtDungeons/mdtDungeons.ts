import aaMdtData from './aa_mdt.json'
import adMdtData from './ad_mdt.json'
import bhMdtData from './bh_mdt.json'
import brhMdtData from './brh_mdt.json'
import dhtMdtData from './dht_mdt.json'
import fallMdtData from './fall_mdt.json'
import riseMdtData from './rise_mdt.json'
import ebMdtData from './eb_mdt.json'
import nokMdtData from './nok_mdt.json'
import tottMdtData from './tott_mdt.json'
import wcmMdtData from './wcm_mdt.json'
import { DungeonKey, MdtDungeon, MdtDungeonFake, MobSpawn, SpawnId } from '../types.ts'
import { mdtEnemiesToMobSpawns } from '../../util/mobSpawns.ts'

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
