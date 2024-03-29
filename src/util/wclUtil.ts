import { Pull, Route } from './types.ts'
import { Dungeon, MobSpawn, Point, SpawnId } from '../data/types.ts'
import { dungeons } from '../data/dungeons.ts'
import { distance } from './numbers.ts'
import { averagePoint, tally } from './nodash.ts'

export type WclEventSimplified = {
  timestamp: number
  gameId: number
  instanceId?: number
  actorId: number
  x: number
  y: number
}

export type WclResult = WclUrlInfo & {
  encounterID: number
  keystoneLevel: number
  events: WclEventSimplified[]
}

export type WclUrlInfo = {
  code: string
  fightId: number
}

type Group = {
  id: string
  mobCounts: Record<number, number>
  averagePos: Point
}

export const wclPointToLeafletPoint = ({ x, y }: { x: number; y: number }) =>
  [0.00268 * y - 258, 0.002688 * x + 634] as Point

export function urlToWclInfo(url: string): WclUrlInfo {
  if (!url.startsWith('http')) url = 'https://' + url

  const code = url.match(/\/reports\/(\w+)/)?.[1]
  if (!code)
    throw new Error(
      `Invalid warcraftlogs URL: missing report code. The URL have /reports/[code] in it.`,
    )

  const fightId = url.match(/fight=(\d+)/)?.[1]
  if (!fightId)
    throw new Error(
      `Invalid warcraftlogs URL: missing fight ID. Make sure you have a dungeon run selected. The URL must have fight=[number] in it.`,
    )

  return { code, fightId: Number(fightId) }
}

export function wclRouteToRoute(wclResult: WclResult) {
  const dungeon = dungeons.find((dungeon) => dungeon.wclEncounterId === wclResult.encounterID)

  if (!dungeon) throw new Error(`This WCL dungeon is not yet supported by Threechest.`)

  const errors: string[] = []
  const pulls = wclEventsToPulls(wclResult.events, dungeon, errors)
  const route: Route = {
    uid: `${wclResult.code}-${wclResult.fightId}`,
    name: `WCL ${dungeon.key.toUpperCase()} +${wclResult.keystoneLevel}`,
    dungeonKey: dungeon.key,
    pulls,
    notes: [],
    drawings: [],
  }

  return {
    route,
    errors,
  }
}

function getPullMobIds(events: WclEventSimplified[], dungeon: Dungeon) {
  const filteredEvents = events.filter((event) =>
    dungeon.mobSpawnsList.some(({ mob }) => mob.id === event.gameId),
  )
  let sortedEvents = filteredEvents.sort((a, b) => a.timestamp - b.timestamp)
  sortedEvents = sortedEvents.map((event) => ({
    ...event,
    timestamp: event.timestamp - sortedEvents[0]!.timestamp,
  }))

  const pullMobIds: Array<Array<{ mobId: number; pos: Point }>> = []
  const newPull = (): Array<{ mobId: number; pos: Point }> => []
  let currentPull = newPull()
  let currentTimestamp = sortedEvents[0]!.timestamp

  for (const event of sortedEvents) {
    if (event.timestamp - currentTimestamp > 20_000) {
      pullMobIds.push(currentPull)
      currentPull = newPull()
    }

    currentTimestamp = event.timestamp
    currentPull.push({ mobId: event.gameId, pos: wclPointToLeafletPoint(event) })
  }

  return pullMobIds
}

function getPulledGroups(
  remainingMobs: Record<number, number>,
  groups: Group[],
  groupIdx: number = 0,
): string[] | null {
  if (Object.values(remainingMobs).every((n) => n === 0)) {
    // no mobs left, solved!
    return []
  }

  const group = groups[groupIdx]
  if (group === undefined) return null

  const newRemainingMobs = { ...remainingMobs }

  let isCompatible = true
  for (const [mobId, count] of Object.entries(group.mobCounts)) {
    const remainingCount = (newRemainingMobs[Number(mobId)] ?? 0) - count
    if (remainingCount < 0) {
      isCompatible = false
      break
    }
    newRemainingMobs[Number(mobId)] = remainingCount
  }

  if (isCompatible) {
    const addedGroups = getPulledGroups(newRemainingMobs, groups, groupIdx + 1)
    if (addedGroups !== null) {
      return [group.id, ...addedGroups]
    }
  }

  return getPulledGroups(remainingMobs, groups, groupIdx + 1)
}

function calculateExactPull(
  pull: Array<{ mobId: number; pos: Point }>,
  groupsRemaining: Group[],
  groupMobSpawns: Partial<Record<number | string, MobSpawn[]>>,
  spawnIdsTaken: Set<string>,
  dungeon: Dungeon,
  idx: number,
  errors: string[],
): { spawnIds: SpawnId[] | null; groupsRemaining: Group[] } {
  const pullAveragePos = averagePoint(pull.map(({ pos }) => pos))
  const pullMobCounts = tally(pull, ({ mobId }) => mobId)

  const groups = groupsRemaining
    .sort((a, b) => distance(a.averagePos, pullAveragePos) - distance(b.averagePos, pullAveragePos))
    .filter(({ mobCounts }) => pull.some(({ mobId }) => (mobCounts[mobId] ?? 0) > 0))

  const pulledGroups = getPulledGroups(pullMobCounts, groups)

  if (pulledGroups === null)
    return findExactSpawns(pull, groupsRemaining, spawnIdsTaken, dungeon, errors, idx)

  const spawnIds = pulledGroups.flatMap((groupId) =>
    groupMobSpawns[groupId]!.map(({ spawn }) => spawn.id),
  )

  groupsRemaining = groupsRemaining.filter((group) => !pulledGroups.includes(group.id))

  spawnIds.forEach(spawnIdsTaken.add, spawnIdsTaken)
  return { spawnIds, groupsRemaining }
}

function findExactSpawns(
  pull: Array<{ mobId: number; pos: Point }>,
  groupsRemaining: Group[],
  spawnIdsTaken: Set<string>,
  dungeon: Dungeon,
  errors: string[],
  idx: number,
) {
  const mobSpawns: MobSpawn[] = []
  for (const { mobId, pos } of pull) {
    const matchingMobs = dungeon.mobSpawnsList.filter(({ mob }) => mob.id === mobId)
    const available = matchingMobs.filter(({ spawn }) => !spawnIdsTaken.has(spawn.id))

    if (available.length === 0) {
      // If it doesn't matter for count just ignore it
      if (matchingMobs.length !== 0 && matchingMobs[0]!.mob.count === 0) continue

      errors.push(`Failed at finding individual matching mob id ${mobId} in pull ${idx}`)
      return { spawnIds: null, groupsRemaining }
    }

    const nearest = available.sort(
      (a, b) => distance(a.spawn.pos, pos) - distance(b.spawn.pos, pos),
    )[0]
    mobSpawns.push(nearest!)
  }

  groupsRemaining = groupsRemaining.filter((group) =>
    mobSpawns.some(({ spawn }) =>
      spawn.group ? group.id !== String(spawn.group) : group.id !== spawn.id,
    ),
  )

  const spawnIds = mobSpawns.map(({ spawn }) => spawn.id)
  spawnIds.forEach(spawnIdsTaken.add, spawnIdsTaken)
  return { spawnIds, groupsRemaining }
}

export function wclEventsToPulls(events: WclEventSimplified[], dungeon: Dungeon, errors: string[]) {
  if (!events.length) return []

  const pullMobIds = getPullMobIds(events, dungeon)

  const groupsBasic = Object.groupBy(dungeon.mobSpawnsList, ({ spawn }) => spawn.group ?? spawn.id)
  let groupsRemaining: Group[] = Object.entries(groupsBasic).map(([groupId, mobSpawns]) => ({
    id: groupId,
    mobCounts: tally(mobSpawns!, ({ mob }) => mob.id),
    averagePos: averagePoint(mobSpawns!.map(({ spawn }) => spawn.pos)),
  }))

  const spawnIdsTaken = new Set<string>()

  const pullSpawns = pullMobIds
    .map((pull, idx) => {
      const { spawnIds, groupsRemaining: newGroupsRemaining } = calculateExactPull(
        pull,
        groupsRemaining,
        groupsBasic,
        spawnIdsTaken,
        dungeon,
        idx,
        errors,
      )

      groupsRemaining = newGroupsRemaining
      return spawnIds
    })
    .filter(Boolean) as SpawnId[][]

  return pullSpawns.map<Pull>((spawns, idx) => ({
    id: idx,
    spawns,
  }))
}
