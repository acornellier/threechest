import type { Pull, Route } from './types.ts'
import type { Dungeon, MobSpawn, Point, Spawn, SpawnId } from '../data/types.ts'
import { dungeons } from '../data/dungeons.ts'
import { distance } from './numbers.ts'
import { tally } from './nodash.ts'
import { averagePoint, polygonCenter } from './polygon.ts'
import { mapHeight, mapWidth } from './map.ts'
import { type MapOffset, mdtMapOffsets, nokOffsets } from '../data/coordinates/mdtMapOffsets.ts'
import { mapBounds } from '../data/coordinates/mapBounds.ts'

export type WclEventSimplified = {
  timestamp: number
  gameId: number
  x?: number
  y?: number
  mapID?: number
  // TODO: debug
  instanceId?: number
  name: string
  actorId: number
}

export type WclResult = WclUrlInfo & {
  encounterID: number
  keystoneLevel: number
  events: WclEventSimplified[]
}

export type WclUrlInfo = {
  code: string
  fightId: number | 'last'
}

type Group = {
  id: string
  mobCounts: Record<number, number>
  averagePos: Point
}

type CalculatedPull = { spawnIds: SpawnId[] | null; groupsRemaining: Group[] }

type WclPoint = {
  x: number
  y: number
  mapID: number
}

const getNokOffsets = ({ x, y }: WclPoint): MapOffset => {
  if (x > -200_000) return nokOffsets[0]
  else if (x > -300_000) return nokOffsets[1]
  else if (y < -150_000) return nokOffsets[2]
  else return nokOffsets[3]
}

const defaultMapOffsets: MapOffset = {
  x: 0,
  y: 0,
  scaleX: 1,
  scaleY: 1,
}

export const wclPointToLeafletPoint = (wclPoint: WclPoint): Point => {
  const { mapID } = wclPoint
  let { x, y } = wclPoint
  const bounds = mapBounds[mapID]
  if (!bounds) throw new Error(`Map ID ${mapID} bounds not defined.`)

  const { yMin, yMax, xMin, xMax } = bounds
  const mdtMapOffset =
    mapID === 2093 ? getNokOffsets(wclPoint) : mdtMapOffsets[mapID] ?? defaultMapOffsets

  x /= 100
  y /= 100

  if (mdtMapOffset.rotate) {
    const angle = (mdtMapOffset.rotate * Math.PI) / 180
    const x1 = x
    const y1 = y
    const a = xMin + (xMax - xMin) / 2
    const b = yMin + (yMax - yMin) / 2

    x = (x1 - a) * Math.cos(angle) - (y1 - b) * Math.sin(angle) + a
    y = (x1 - a) * Math.sin(angle) + (y1 - b) * Math.cos(angle) + b
  }

  const topFracWow = 1 - (y - yMin) / (yMax - yMin)
  const topFracMdt = topFracWow * mdtMapOffset.scaleY + mdtMapOffset.y

  const leftFracWow = (x - xMin) / (xMax - xMin)
  const leftFracMdt = leftFracWow * mdtMapOffset.scaleX + mdtMapOffset.x

  return [-topFracMdt * mapHeight, leftFracMdt * mapWidth]
}

export function urlToWclInfo(url: string): WclUrlInfo {
  if (!url.startsWith('http')) url = 'https://' + url

  const code = url.match(/\/reports\/(\w+)/)?.[1]
  if (!code)
    throw new Error(
      `Invalid warcraftlogs URL: missing report code. The URL have /reports/[code] in it.`,
    )

  const fightId = url.match(/fight=(\d+|last)/)?.[1]
  if (!fightId)
    throw new Error(
      `Invalid warcraftlogs URL: missing fight ID. Make sure you have a dungeon run selected. The URL must have fight=[number] in it.`,
    )

  return { code, fightId: fightId === 'last' ? fightId : Number(fightId) }
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

type MobPos = { mobId: number; pos?: Point }

export function wclEventsToPulls(events: WclEventSimplified[], dungeon: Dungeon, errors: string[]) {
  if (!events.length) return []

  const pullMobIds = getPullMobIds(events, dungeon)

  const groupMobSpawns = Object.groupBy(
    dungeon.mobSpawnsList,
    ({ spawn }) => spawn.group ?? spawn.id,
  )

  let groupsRemaining: Group[] = Object.entries(groupMobSpawns).map(([groupId, mobSpawns]) => {
    const nonZeroCountMobSpawns = mobSpawns!.filter(({ mob }) => mob.count > 0 || mob.isBoss)
    return {
      id: groupId,
      mobCounts: tally(nonZeroCountMobSpawns, ({ mob }) => mob.id),
      averagePos: averagePoint(nonZeroCountMobSpawns.map(({ spawn }) => spawn.pos)),
    }
  })

  const spawnIdsTaken = new Set<string>()

  const pullSpawns: SpawnId[][] = []
  for (let pass = 1; pass <= 2; ++pass) {
    pullMobIds.forEach((pull, idx) => {
      if (pullSpawns[idx] !== undefined) return

      const { spawnIds, groupsRemaining: newGroupsRemaining } = calculateExactPull(
        pull,
        groupsRemaining,
        groupMobSpawns,
        spawnIdsTaken,
        dungeon,
        idx,
        pass === 2,
        errors,
      )

      groupsRemaining = newGroupsRemaining

      if (spawnIds !== null) {
        pullSpawns[idx] = spawnIds
      }
    })
  }

  return pullSpawns.filter(Boolean).map<Pull>((spawns, idx) => ({
    id: idx,
    spawns,
  }))
}

function getPullMobIds(events: WclEventSimplified[], dungeon: Dungeon) {
  const filteredEvents = events.filter((event) =>
    dungeon.mobSpawnsList.some(({ mob }) => mob.id === event.gameId),
  )

  filteredEvents.sort((a, b) => a.timestamp - b.timestamp)

  const pullMobIds: MobPos[][] = []
  const newPull = (): MobPos[] => []
  let currentPull = newPull()
  let currentTimestamp = filteredEvents[0]!.timestamp

  for (const event of filteredEvents) {
    if (event.timestamp - currentTimestamp > 20_000) {
      pullMobIds.push(currentPull)
      currentPull = newPull()
    }

    currentTimestamp = event.timestamp
    currentPull.push({
      mobId: event.gameId,
      pos:
        event.x && event.y && event.mapID
          ? wclPointToLeafletPoint({ x: event.x, y: event.y, mapID: event.mapID })
          : undefined,
    })
  }

  return pullMobIds
}

function calculateExactPull(
  pull: MobPos[],
  groupsRemaining: Group[],
  groupMobSpawns: Partial<Record<number | string, MobSpawn[]>>,
  spawnIdsTaken: Set<string>,
  dungeon: Dungeon,
  idx: number,
  secondPass: boolean,
  errors: string[],
): CalculatedPull {
  const filteredPositions = pull.map(({ pos }) => pos).filter(Boolean) as Point[]
  const pullCenter = polygonCenter(filteredPositions)
  const pullMobCounts = tally(pull, ({ mobId }) => mobId)

  const maxDistanceToGroup = 80
  const groups = groupsRemaining
    .filter(({ id }) => !groupMobSpawns[id]!.some(({ spawn }) => spawnIdsTaken.has(spawn.id)))
    .filter(({ mobCounts }) => pull.some(({ mobId }) => (mobCounts[mobId] ?? 0) > 0))
    .filter(({ averagePos }) => secondPass || distance(averagePos, pullCenter) < maxDistanceToGroup)
    .sort((a, b) => distance(a.averagePos, pullCenter) - distance(b.averagePos, pullCenter))

  const pulledGroups = getPulledGroups(pullMobCounts, groups)

  if (pulledGroups === null) {
    if (!secondPass) return { spawnIds: null, groupsRemaining }

    return findExactSpawns(pull, groupsRemaining, spawnIdsTaken, dungeon, errors, idx)
  }

  const spawnIds = pulledGroups.flatMap((groupId) =>
    groupMobSpawns[groupId]!.map(({ spawn }) => spawn.id),
  )

  groupsRemaining = groupsRemaining.filter((group) => !pulledGroups.includes(group.id))

  spawnIds.forEach(spawnIdsTaken.add, spawnIdsTaken)
  return { spawnIds, groupsRemaining }
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

function findExactSpawns(
  pull: MobPos[],
  groupsRemaining: Group[],
  spawnIdsTaken: Set<string>,
  dungeon: Dungeon,
  errors: string[],
  idx: number,
): CalculatedPull {
  const spawns: Spawn[] = []
  for (const { mobId, pos } of pull) {
    const matchingMobs = dungeon.mobSpawnsList.filter(({ mob }) => mob.id === mobId)
    const available = matchingMobs.filter(({ spawn }) => !spawnIdsTaken.has(spawn.id))

    if (available.length === 0) {
      // If it doesn't matter for count just ignore it
      if (matchingMobs.length !== 0 && matchingMobs[0]!.mob.count === 0) continue

      errors.push(`Failed at finding individual matching mob id ${mobId} in pull ${idx}`)
      return { spawnIds: null, groupsRemaining }
    }

    const sortedAvailable = !pos
      ? available
      : available.sort((a, b) => distance(a.spawn.pos, pos) - distance(b.spawn.pos, pos))
    const nearest = sortedAvailable[0]!
    spawns.push(nearest.spawn)
    spawnIdsTaken.add(nearest.spawn.id)
  }

  groupsRemaining = groupsRemaining.filter((group) =>
    spawns.some((spawn) =>
      spawn.group ? group.id !== String(spawn.group) : group.id !== spawn.id,
    ),
  )

  const spawnIds = spawns.map(({ id }) => id)
  return { spawnIds, groupsRemaining }
}
