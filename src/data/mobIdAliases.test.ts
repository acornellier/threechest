import { describe, expect, it } from 'vitest'
import { canonicalDungeon, canonicalMobId } from './mobIdAliases.ts'
import type { Dungeon, Mob, MobSpawn, SpawnId } from './types.ts'

const mob = (id: number): Mob => ({ id }) as Mob

const makeDungeon = (mobSpawnList: Array<[SpawnId, number]>): Dungeon => {
  const mobs = new Map(mobSpawnList.map(([, mobId]) => [mobId, mob(mobId)]))
  const mobSpawns = mobSpawnList.reduce<Record<SpawnId, MobSpawn>>((acc, [spawnId, mobId]) => {
    acc[spawnId] = { mob: mobs.get(mobId)!, spawn: { id: spawnId } } as MobSpawn
    return acc
  }, {})
  return { key: 'murd', mobSpawns, mobSpawnsList: Object.values(mobSpawns) } as Dungeon
}

describe('canonicalMobId', () => {
  it('maps a randomized variant onto its canonical id and leaves others alone', () => {
    expect(canonicalMobId(255604)).toBe(236082)
    expect(canonicalMobId(236082)).toBe(236082)
    expect(canonicalMobId(1)).toBe(1)
  })
})

describe('canonicalDungeon', () => {
  it('rewrites aliased mob ids without touching spawns', () => {
    const dungeon = makeDungeon([
      ['6-5', 236082],
      ['39-1', 255604],
      ['1-1', 1],
    ])
    const canonical = canonicalDungeon(dungeon)

    expect(canonical.mobSpawns['39-1']!.mob.id).toBe(236082)
    expect(canonical.mobSpawns['39-1']!.spawn).toBe(dungeon.mobSpawns['39-1']!.spawn)
    expect(canonical.mobSpawns['1-1']!.mob).toBe(dungeon.mobSpawns['1-1']!.mob)
    expect(canonical.mobSpawnsList.map(({ spawn }) => spawn.id)).toEqual(
      dungeon.mobSpawnsList.map(({ spawn }) => spawn.id),
    )
    // The real dungeon keeps the real ids.
    expect(dungeon.mobSpawns['39-1']!.mob.id).toBe(255604)
  })

  it('returns the same dungeon when nothing is aliased, and memoizes otherwise', () => {
    const unaliased = makeDungeon([['1-1', 1]])
    expect(canonicalDungeon(unaliased)).toBe(unaliased)

    const aliased = makeDungeon([['39-1', 255604]])
    expect(canonicalDungeon(aliased)).toBe(canonicalDungeon(aliased))
  })
})
