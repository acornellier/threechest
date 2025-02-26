import cm from './mdtDungeons/cm_mdt.json'
import dc from './mdtDungeons/dc_mdt.json'
import mw from './mdtDungeons/mw_mdt.json'
import of from './mdtDungeons/of_mdt.json'
import psf from './mdtDungeons/psf_mdt.json'
import tm from './mdtDungeons/tm_mdt.json'
import tr from './mdtDungeons/tr_mdt.json'
import top from './mdtDungeons/top_mdt.json'
import type { MdtDungeon, MdtDungeonFake, MobSpawn, SpawnId } from './types.ts'
import { mdtEnemiesToMobSpawns } from '../util/mobSpawns.ts'
import type { DungeonKey } from './dungeonKeys.ts'

const mdtDungeonsFake: Record<DungeonKey, MdtDungeonFake> = {
  cm,
  dc,
  mw,
  of,
  psf,
  tm,
  tr,
  top,
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
