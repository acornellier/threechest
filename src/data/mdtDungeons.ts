import aa from './mdtDungeons/aa_mdt.json'
import ad from './mdtDungeons/ad_mdt.json'
import av from './mdtDungeons/av_mdt.json'
import bh from './mdtDungeons/bh_mdt.json'
import brh from './mdtDungeons/brh_mdt.json'
import dht from './mdtDungeons/dht_mdt.json'
import hoi from './mdtDungeons/hoi_mdt.json'
import fall from './mdtDungeons/fall_mdt.json'
import rise from './mdtDungeons/rise_mdt.json'
import eb from './mdtDungeons/eb_mdt.json'
import nelth from './mdtDungeons/nelth_mdt.json'
import nok from './mdtDungeons/nok_mdt.json'
import rlp from './mdtDungeons/rlp_mdt.json'
import tott from './mdtDungeons/tott_mdt.json'
import uld from './mdtDungeons/uld_mdt.json'
import wcm from './mdtDungeons/wcm_mdt.json'
import { MdtDungeon, MdtDungeonFake, MobSpawn, SpawnId } from './types.ts'
import { mdtEnemiesToMobSpawns } from '../util/mobSpawns.ts'
import { DungeonKey } from './dungeonKeys.ts'

const mdtDungeonsFake: Record<DungeonKey, MdtDungeonFake> = {
  aa,
  ad,
  av,
  bh,
  brh,
  dht,
  fall,
  hoi,
  nelth,
  nok,
  rise,
  rlp,
  eb,
  tott,
  uld,
  wcm,
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
