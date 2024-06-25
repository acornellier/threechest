import ak from './mdtDungeons/ak_mdt.json'
import cot from './mdtDungeons/cot_mdt.json'
import db from './mdtDungeons/db_mdt.json'
import gb from './mdtDungeons/gb_mdt.json'
import mot from './mdtDungeons/mot_mdt.json'
import nw from './mdtDungeons/nw_mdt.json'
import sob from './mdtDungeons/sob_mdt.json'
import sv from './mdtDungeons/sv_mdt.json'
import type { MdtDungeon, MdtDungeonFake, MobSpawn, SpawnId } from './types.ts'
import { mdtEnemiesToMobSpawns } from '../util/mobSpawns.ts'
import type { DungeonKey } from './dungeonKeys.ts'

const mdtDungeonsFake: Record<DungeonKey, MdtDungeonFake> = {
  ak,
  cot,
  db,
  gb,
  mot,
  nw,
  sob,
  sv,
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
