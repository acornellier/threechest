import aa from './mdtDungeons/aa_mdt.json'
import av from './mdtDungeons/av_mdt.json'
import bh from './mdtDungeons/bh_mdt.json'
import hoi from './mdtDungeons/hoi_mdt.json'
import nelth from './mdtDungeons/nelth_mdt.json'
import nok from './mdtDungeons/nok_mdt.json'
import rlp from './mdtDungeons/rlp_mdt.json'
import uld from './mdtDungeons/uld_mdt.json'
import type { MdtDungeon, MdtDungeonFake, MobSpawn, SpawnId } from './types.ts'
import { mdtEnemiesToMobSpawns } from '../util/mobSpawns.ts'
import type { DungeonKey } from './dungeonKeys.ts'

const mdtDungeonsFake: Record<DungeonKey, MdtDungeonFake> = {
  aa,
  av,
  bh,
  hoi,
  nelth,
  nok,
  rlp,
  uld,
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
