import type { MdtDungeon, MdtDungeonFake, MobFake, MobSpawn, SpawnFake, SpawnId } from './types.ts'
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

// Patches for incorrect upstream MDT data. Mobs are keyed by npc id, spawns by spawn id.
const mdtMobPatches: Partial<Record<DungeonKey, Array<{ id: number; patch: Partial<MobFake> }>>> = {
  rlp: [
    { id: 187897, patch: { isBoss: false } }, // Defier Draghar
    { id: 197698, patch: { isBoss: false } }, // Thunderhead
    { id: 197697, patch: { isBoss: false } }, // Flamegullet
    { id: 197535, patch: { isBoss: false } }, // High Channeler Ryvati
  ],
}

const mdtSpawnPatches: Partial<
  Record<DungeonKey, Array<{ spawnId: SpawnId; patch: Partial<SpawnFake> }>>
> = {}

for (const [key, patches] of Object.entries(mdtMobPatches)) {
  const dungeon = mdtDungeonsFake[key as DungeonKey]
  for (const { id, patch } of patches) {
    const mob = dungeon.enemies.find((enemy) => enemy.id === id)
    if (mob) {
      Object.assign(mob, patch)
    }
  }
}

for (const [key, patches] of Object.entries(mdtSpawnPatches)) {
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

const spellAttributePatches: Record<number, string[]> = {
  // Instant cast, and not actually interruptible in game.
  1238158: [], // vale Lightgorged Lasher — Lightbloom Pollination
}

for (const dungeon of Object.values(mdtDungeonsFake)) {
  for (const enemy of dungeon.enemies) {
    for (const spell of enemy.spells) {
      const attributes = spellAttributePatches[spell.id]
      if (attributes) {
        spell.attributes = attributes
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
