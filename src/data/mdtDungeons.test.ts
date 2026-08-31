import { describe, expect, it } from 'vitest'
import { mdtMobSpawns } from './mdtDungeons.ts'

describe('mdtSpawnMobPatches', () => {
  it('resolves tos 11-6 to a Lightning Serpent while keeping its MDT identity', () => {
    const { mob, spawn } = mdtMobSpawns.tos['11-6']!

    expect(mob.id).toBe(135846)
    expect(mob.name).toBe('Lightning Serpent')
    expect(mob.enemyIndex).toBe(11)
    expect(spawn.id).toBe('11-6')
    expect(spawn.idx).toBe(6)
    expect(spawn.group).toBe(23)
  })

  it('leaves the other group 23 spawn alone', () => {
    expect(mdtMobSpawns.tos['11-7']!.mob.name).toBe('Faithless Subjugator')
  })
})
