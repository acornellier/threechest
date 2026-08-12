import type { MdtDungeon, MdtDungeonFake, MobSpawn, SpawnFake, SpawnId } from './types.ts'
import { mdtEnemiesToMobSpawns } from '../util/mobSpawns.ts'
import type { DungeonKey } from './dungeonKeys.ts'
import murd from './mdtDungeons/murd_mdt.json'
import nalo from './mdtDungeons/nalo_mdt.json'
import vale from './mdtDungeons/vale_mdt.json'
// `void` is a reserved word, so the import is aliased.
import voidDungeon from './mdtDungeons/void_mdt.json'
import fang from './mdtDungeons/fang_mdt.json'
import rlp from './mdtDungeons/rlp_mdt.json'
import tos from './mdtDungeons/tos_mdt.json'
import kr from './mdtDungeons/kr_mdt.json'

const mdtDungeonsFake: Record<DungeonKey, MdtDungeonFake> = {
  murd,
  nalo,
  vale,
  void: voidDungeon,
  fang,
  rlp,
  tos,
  kr,
}

// Patches for incorrect upstream MDT data
const mdtPatches: Partial<
  Record<DungeonKey, Array<{ spawnId: SpawnId; patch: Partial<SpawnFake> }>>
> = {}

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
