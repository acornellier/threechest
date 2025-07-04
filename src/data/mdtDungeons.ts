import ak from './mdtDungeons/ak_mdt.json'
import db from './mdtDungeons/db_mdt.json'
import eda from './mdtDungeons/eda_mdt.json'
import gmbt from './mdtDungeons/gmbt_mdt.json'
import hoa from './mdtDungeons/hoa_mdt.json'
import of from './mdtDungeons/of_mdt.json'
import psf from './mdtDungeons/psf_mdt.json'
import strt from './mdtDungeons/strt_mdt.json'
import type { MdtDungeon, MdtDungeonFake, MobSpawn, SpawnId } from './types.ts'
import { mdtEnemiesToMobSpawns } from '../util/mobSpawns.ts'
import type { DungeonKey } from './dungeonKeys.ts'

const mdtDungeonsFake: Record<DungeonKey, MdtDungeonFake> = {
  ak,
  db,
  eda,
  gmbt,
  hoa,
  of,
  psf,
  strt,
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
