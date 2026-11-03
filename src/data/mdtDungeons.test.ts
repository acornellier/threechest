import { describe, expect, it } from 'vitest'
import { mdtMobSpawns } from './mdtDungeons.ts'

describe('tos group 23', () => {
  it('holds a Lightning Serpent next to its Faithless Subjugator', () => {
    const serpent = mdtMobSpawns.tos['8-8']!
    expect(serpent.mob.name).toBe('Lightning Serpent')
    expect(serpent.spawn.group).toBe(23)

    const subjugator = mdtMobSpawns.tos['11-6']!
    expect(subjugator.mob.name).toBe('Faithless Subjugator')
    expect(subjugator.spawn.group).toBe(23)
  })
})

describe('mdtSpawnPatches', () => {
  it('detaches the vale Grovecrawler from the G64 beetles', () => {
    expect(mdtMobSpawns.vale['10-10']!.spawn.group).toBeNull()
    expect(mdtMobSpawns.vale['9-30']!.spawn.group).toBe(64)
  })
})
