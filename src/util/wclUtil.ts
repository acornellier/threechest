import { Pull, Route } from './types.ts'
import { newRouteUid } from '../store/routes/routesReducer.ts'
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

export type WclResult = {
  encounterID: number
  keystoneLevel: number
  events: WclEventSimplified[]
}

export const wclPointToLeafletPoint = ({ x, y }: { x: number; y: number }) =>
  [0.00268 * y - 258, 0.002688 * x + 634] as Point

export function urlToWclInfo(url: string) {
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
  const { pulls } = wclEventsToPulls(wclResult.events, dungeon, errors)
  const route: Route = {
    uid: newRouteUid(),
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

type Group = {
  id: string
  mobCounts: Record<number, number>
  averagePos: Point
}

export function wclEventsToPulls(events: WclEventSimplified[], dungeon: Dungeon, errors: string[]) {
  if (!events.length) return { pulls: [], sortedEvents: [], groups: [] }

  const filteredEvents = events.filter((event) =>
    dungeon.mobSpawnsList.some(({ mob }) => mob.id === event.gameId),
  )
  let sortedEvents = filteredEvents.sort((a, b) => a.timestamp - b.timestamp)
  sortedEvents = sortedEvents.map((event) => ({
    ...event,
    timestamp: event.timestamp - sortedEvents[0]!.timestamp,
  }))

  const groupsBasic = Object.groupBy(dungeon.mobSpawnsList, ({ spawn }) => spawn.group ?? spawn.id)
  let groupsRemaining: Group[] = Object.entries(groupsBasic).map(([groupId, mobSpawns]) => ({
    id: groupId,
    mobCounts: tally(mobSpawns!, ({ mob }) => mob.id),
    averagePos: averagePoint(mobSpawns!.map(({ spawn }) => spawn.pos)),
  }))

  const spawnIdsTaken = new Set<string>()

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

  const pullSpawns: SpawnId[][] = []
  pullMobIds.forEach((pull, idx) => {
    const pullAveragePos = averagePoint(pull.map(({ pos }) => pos))

    const pullMobCounts = tally(pull, ({ mobId }) => mobId)

    const sortedGroups = groupsRemaining.sort(
      (a, b) => distance(a.averagePos, pullAveragePos) - distance(b.averagePos, pullAveragePos),
    )

    const getPulledGroups = (
      groupIdx: number,
      remainingMobs: Record<number, number>,
    ): string[] | null => {
      if (Object.values(remainingMobs).every((n) => n === 0)) {
        // no mobs left, solved!
        return []
      }

      const group = sortedGroups[groupIdx]
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
        for (let newGroupIdx = groupIdx + 1; newGroupIdx < sortedGroups.length; ++newGroupIdx) {
          const addedGroups = getPulledGroups(newGroupIdx, newRemainingMobs)
          if (addedGroups !== null) {
            return [group.id, ...addedGroups]
          }
        }
      }
      return getPulledGroups(groupIdx + 1, newRemainingMobs)
    }

    const pulledGroups = getPulledGroups(0, pullMobCounts)

    if (pulledGroups !== null) {
      groupsRemaining = groupsRemaining.filter((group) => !pulledGroups.includes(group.id))

      const spawnIds = pulledGroups.flatMap((groupId) =>
        groupsBasic[groupId]!.map(({ spawn }) => spawn.id),
      )
      spawnIds.forEach(spawnIdsTaken.add, spawnIdsTaken)
      pullSpawns.push(spawnIds)
      return
    }

    const mobSpawns: MobSpawn[] = []
    for (const { mobId, pos } of pull) {
      const matchingMobs = dungeon.mobSpawnsList.filter(({ mob }) => mob.id === mobId)
      const available = matchingMobs.filter(({ spawn }) => !spawnIdsTaken.has(spawn.id))

      if (available.length === 0) {
        // If it doesn't matter for count just ignore it
        if (matchingMobs.length !== 0 && matchingMobs[0]!.mob.count === 0) continue

        errors.push(`Failed at finding individual matching mob id ${mobId} in pull ${idx}`)
        return
      }

      const nearest = available.sort(
        (a, b) => distance(a.spawn.pos, pos) - distance(b.spawn.pos, pos),
      )[0]
      mobSpawns.push(nearest!)
    }

    const spawnIds = mobSpawns.map(({ spawn }) => spawn.id)
    spawnIds.forEach(spawnIdsTaken.add, spawnIdsTaken)
    pullSpawns.push(spawnIds)
    groupsRemaining = groupsRemaining.filter((group) =>
      mobSpawns.some(({ spawn }) =>
        spawn.group ? group.id !== String(spawn.group) : group.id !== spawn.id,
      ),
    )
  })

  const pulls: Pull[] = pullSpawns.map((spawns, idx) => {
    return {
      id: idx,
      spawns,
    }
  })

  return { pulls }
}
