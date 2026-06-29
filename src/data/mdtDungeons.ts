import type { MdtDungeon, MdtDungeonFake, MobSpawn, SpawnFake, SpawnId } from './types.ts'
import { mdtEnemiesToMobSpawns } from '../util/mobSpawns.ts'
import type { DungeonKey } from './dungeonKeys.ts'
import aa from './mdtDungeons/aa_mdt.json'
import magi from './mdtDungeons/magi_mdt.json'
import cavns from './mdtDungeons/cavns_mdt.json'
import xenas from './mdtDungeons/xenas_mdt.json'
import wind from './mdtDungeons/wind_mdt.json'
import pit from './mdtDungeons/pit_mdt.json'
import seat from './mdtDungeons/seat_mdt.json'
import sky from './mdtDungeons/sky_mdt.json'

const mdtDungeonsFake: Record<DungeonKey, MdtDungeonFake> = {
  aa,
  magi,
  cavns,
  xenas,
  wind,
  pit,
  seat,
  sky,
}

// Patches for incorrect upstream MDT data
const mdtPatches: Partial<
  Record<DungeonKey, Array<{ spawnId: SpawnId; patch: Partial<SpawnFake> }>>
> = {
  wind: [
    { spawnId: '6-3', patch: { group: null } }, // incorrectly assigned to group 36
  ],
}

for (const [key, patches] of Object.entries(mdtPatches)) {
  const dungeon = mdtDungeonsFake[key as DungeonKey]
  for (const { spawnId, patch } of patches) {
    for (const enemy of dungeon.enemies) {
      const spawn = enemy.spawns.find((s) => s.id === spawnId)
      if (spawn) {
        Object.assign(spawn, patch)
        break
      }
    }
  }
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
