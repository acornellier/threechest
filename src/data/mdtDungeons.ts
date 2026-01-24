import mt from './mdtDungeons/mt_mdt.json'
import mc from './mdtDungeons/mc_mdt.json'
import npx from './mdtDungeons/npx_mdt.json'
import ws from './mdtDungeons/ws_mdt.json'
import aa from './mdtDungeons/aa_mdt.json'
import pos from './mdtDungeons/pos_mdt.json'
import sott from './mdtDungeons/sott_mdt.json'
import sr from './mdtDungeons/sr_mdt.json'
import type { MdtDungeon, MdtDungeonFake, MobSpawn, SpawnId } from './types.ts'
import { mdtEnemiesToMobSpawns } from '../util/mobSpawns.ts'
import type { DungeonKey } from './dungeonKeys.ts'

const mdtDungeonsFake: Record<DungeonKey, MdtDungeonFake> = {
  mt,
  mc,
  npx,
  ws,
  aa,
  pos,
  sott,
  sr,
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
