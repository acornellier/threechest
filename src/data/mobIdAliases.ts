import type { Dungeon, Mob, MobSpawn } from './types.ts'

// Some mobs spawn as one of two npc ids at random each run (male/female variants of the same
// creature — identical name, health and count). MDT stores whichever id it happened to record, so a
// WCL fight regularly reports a variant id at a spawn point MDT lists under the other id. Fold the
// variant onto the id MDT uses for the bulk of its spawns so the two sides are comparable.
//
// Only add a pair after checking that the variant's WCL positions really do land on the other id's
// spawns. Sharing a name and health is not enough: nalo's Keen-Eyed Strikers (241816 / 245752) look
// like such a pair, but 245752 is a distinct spawn that MDT places correctly.
//
// Route calculation only — the app itself shows the real ids.
const mobIdAliases: Record<number, number> = {
  255604: 236082, // Seductive Sayaad (Murder Row)
}

export const canonicalMobId = (mobId: number): number => mobIdAliases[mobId] ?? mobId

const canonicalDungeonCache = new WeakMap<Dungeon, Dungeon>()

// The dungeon with every aliased mob id replaced by its canonical id, so mob ids read off spawns
// are directly comparable to canonicalMobId(gameId). Spawns are untouched, so spawn ids produced
// against this dungeon are still valid for the real one.
export function canonicalDungeon(dungeon: Dungeon): Dungeon {
  const cached = canonicalDungeonCache.get(dungeon)
  if (cached) return cached

  const canonical = dungeon.mobSpawnsList.some(({ mob }) => canonicalMobId(mob.id) !== mob.id)
    ? aliasDungeon(dungeon)
    : dungeon
  canonicalDungeonCache.set(dungeon, canonical)
  return canonical
}

function aliasDungeon(dungeon: Dungeon): Dungeon {
  const aliasedMobs = new Map<Mob, Mob>()
  const aliasMob = (mob: Mob): Mob => {
    let aliased = aliasedMobs.get(mob)
    if (!aliased) {
      const id = canonicalMobId(mob.id)
      aliased = id === mob.id ? mob : { ...mob, id }
      aliasedMobs.set(mob, aliased)
    }
    return aliased
  }

  const mobSpawns = Object.entries(dungeon.mobSpawns).reduce<Record<string, MobSpawn>>(
    (acc, [spawnId, mobSpawn]) => {
      acc[spawnId] = { ...mobSpawn, mob: aliasMob(mobSpawn.mob) }
      return acc
    },
    {},
  )

  return { ...dungeon, mobSpawns, mobSpawnsList: Object.values(mobSpawns) }
}
