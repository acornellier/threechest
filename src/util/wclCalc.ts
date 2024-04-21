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
  id?: number
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

type PullStatus = {
  mobEventsRemaining: MobEvent[]
  spawnIds: SpawnId[]
  complete?: boolean
}

type CalculatedPull = {
  spawnIds: SpawnId[]
  groupsRemaining: Group[]
  mobEventsRemaining: MobEvent[]
}

export type WclPoint = {
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

type MobEvent = { timestamp: number; mobId: number; pos?: Point }

const spawnGroup = (spawn: Spawn) => (spawn.group ? String(spawn.group) : spawn.id)

export function wclEventsToPulls(events: WclEventSimplified[], dungeon: Dungeon, errors: string[]) {
  if (!events.length) return []

  const pullMobIds = getPullMobIds(events, dungeon)

  const groupMobSpawns = Object.groupBy(dungeon.mobSpawnsList, ({ spawn }) => spawnGroup(spawn))

  let groupsRemaining = Object.entries(groupMobSpawns).map<Group>(([groupId, mobSpawns]) => {
    const nonZeroCountMobSpawns = mobSpawns!.filter(({ mob }) => mob.count > 0 || mob.isBoss)
    return {
      id: groupId,
      mobSpawns: nonZeroCountMobSpawns,
      mobCounts: tally(nonZeroCountMobSpawns, ({ mob }) => mob.id),
      averagePos: averagePoint(nonZeroCountMobSpawns.map(({ spawn }) => spawn.pos)),
    }
  })

  const spawnIdsTaken = new Set<SpawnId>()

  const pullStatuses = pullMobIds.map<PullStatus>((mobEvents) => ({
    mobEventsRemaining: mobEvents,
    spawnIds: [],
    groupsRemaining,
  }))

  for (let pass = 1; pass <= 3; ++pass) {
    pullStatuses.forEach((pullStatus, idx) => {
      if (pullStatus.complete) return

      const calculatedPull =
        pass === 1
          ? calculatePullFromSubPulls(
              pullStatus.mobEventsRemaining,
              groupsRemaining,
              groupMobSpawns,
              spawnIdsTaken,
              dungeon,
              idx,
              errors,
            )
          : calculateExactPull(
              pullStatus.mobEventsRemaining,
              groupsRemaining,
              groupMobSpawns,
              spawnIdsTaken,
              dungeon,
              idx,
              pass === 3,
              80,
              errors,
            )

      if (calculatedPull !== null) {
        groupsRemaining = calculatedPull.groupsRemaining
        pullStatus.spawnIds.push(...calculatedPull.spawnIds)
        pullStatus.mobEventsRemaining = calculatedPull.mobEventsRemaining

        if (pullStatus.mobEventsRemaining.length === 0) pullStatus.complete = true
      }

      console.log(pullStatus)
    })
  }

  return pullStatuses.filter(Boolean).map<Pull>(({ spawnIds }, idx) => ({
    id: idx,
    spawns: spawnIds,
  }))
}

function getPullMobIds(events: WclEventSimplified[], dungeon: Dungeon) {
  const filteredEvents = events.filter((event) =>
    dungeon.mobSpawnsList.some(({ mob }) => mob.id === event.gameId),
  )

  filteredEvents.sort((a, b) => a.timestamp - b.timestamp)

  const pullMobIds: MobEvent[][] = []
  const newPull = (): MobEvent[] => []
  let currentPull = newPull()
  let currentTimestamp = filteredEvents[0]!.timestamp

  for (const event of filteredEvents) {
    if (event.timestamp - currentTimestamp > 20_000) {
      pullMobIds.push(currentPull)
      currentPull = newPull()
    }

    currentTimestamp = event.timestamp
    currentPull.push({
      timestamp: event.timestamp,
      mobId: event.gameId,
      pos:
        event.x && event.y && event.mapID
          ? wclPointToLeafletPoint({ x: event.x, y: event.y, mapID: event.mapID })
          : undefined,
    })
  }

  if (currentPull.length > 0) pullMobIds.push(currentPull)

  return pullMobIds
}

function calculatePullFromSubPulls(
  pull: MobEvent[],
  groupsRemaining: Group[],
  groupMobSpawns: Partial<Record<number | string, MobSpawn[]>>,
  spawnIdsTaken: Set<SpawnId>,
  dungeon: Dungeon,
  idx: number,
  errors: string[],
): CalculatedPull {
  let mobEventsRemaining = pull.slice()
  const spawnIds: SpawnId[] = []
  const subPulls = getSubPulls(pull)

  for (const subPull of subPulls) {
    const calculatedPull = calculateExactPull(
      subPull,
      groupsRemaining,
      groupMobSpawns,
      spawnIdsTaken,
      dungeon,
      idx,
      false,
      20,
      errors,
    )

    if (calculatedPull !== null) {
      groupsRemaining = calculatedPull.groupsRemaining
      spawnIds.push(...calculatedPull.spawnIds)
      mobEventsRemaining = mobEventsRemaining.filter((event) => !subPull.includes(event))
    }
  }

  if (idx + 1 === 12) console.log(subPulls, spawnIds)
  return { spawnIds, groupsRemaining, mobEventsRemaining }
}

function calculateExactPull(
  pull: MobEvent[],
  groupsRemaining: Group[],
  groupMobSpawns: Partial<Record<number | string, MobSpawn[]>>,
  spawnIdsTaken: Set<SpawnId>,
  dungeon: Dungeon,
  idx: number,
  finalPass: boolean,
  maxDistanceToGroup: number,
  errors: string[],
): CalculatedPull | null {
  const filteredPositions = pull.map(({ pos }) => pos).filter(Boolean) as Point[]
  const pullCenter = polygonCenter(filteredPositions)
  const pullMobCounts = tally(pull, ({ mobId }) => mobId)

  const groups = groupsRemaining
    .filter(({ id }) => !groupMobSpawns[id]!.some(({ spawn }) => spawnIdsTaken.has(spawn.id)))
    .filter(({ mobCounts }) => pull.some(({ mobId }) => (mobCounts[mobId] ?? 0) > 0))
    .filter(({ averagePos }) => finalPass || distance(averagePos, pullCenter) < maxDistanceToGroup)
    .sort((a, b) => distance(a.averagePos, pullCenter) - distance(b.averagePos, pullCenter))

  const pulledGroups = getPulledGroups(pullMobCounts, groups)

  if (pulledGroups === null) {
    if (!finalPass) return null

    return findExactSpawns(pull, groupsRemaining, spawnIdsTaken, dungeon, errors, idx)
  }

  const spawnIds = pulledGroups.flatMap((groupId) =>
    groupMobSpawns[groupId]!.map(({ spawn }) => spawn.id),
  )

  groupsRemaining = groupsRemaining.filter((group) => !pulledGroups.includes(group.id))

  spawnIds.forEach(spawnIdsTaken.add, spawnIdsTaken)
  return { spawnIds, groupsRemaining, mobEventsRemaining: [] }
}

function getSubPulls(pull: MobEvent[]) {
  const firstEvent = pull[0]
  if (!firstEvent) return []

  const subPulls: MobEvent[][] = []
  let currentSubPull: MobEvent[] = []
  let currentTimestamp = firstEvent.timestamp
  let currentPos = firstEvent.pos

  for (const event of pull) {
    if (
      event.timestamp - currentTimestamp > 2_000 &&
      event.pos &&
      currentPos &&
      distance(event.pos, currentPos) > 10
    ) {
      subPulls.push(currentSubPull)
      currentSubPull = []
    }

    currentTimestamp = event.timestamp
    if (event.pos) currentPos = event.pos
    currentSubPull.push(event)
  }

  if (currentSubPull.length > 0) subPulls.push(currentSubPull)

  return subPulls
}

function getPulledGroups(
  remainingMobs: Record<number, number>,
  groups: Group[],
  groupIdx: number = 0,
): SpawnId[] | null {
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
  pull: MobEvent[],
  groupsRemaining: Group[],
  spawnIdsTaken: Set<SpawnId>,
  dungeon: Dungeon,
  errors: string[],
  idx: number,
): CalculatedPull | null {
  const mobSpawns: MobSpawn[] = []
  for (const { mobId, pos } of pull) {
    const matchingMobs = dungeon.mobSpawnsList.filter(({ mob }) => mob.id === mobId)
    const available = matchingMobs.filter(({ spawn }) => !spawnIdsTaken.has(spawn.id))

    if (available.length === 0) {
      // If it doesn't matter for count just ignore it
      if (matchingMobs.length !== 0 && matchingMobs[0]!.mob.count === 0) continue

      errors.push(`Failed at finding individual matching mob id ${mobId} in pull ${idx}`)
      return null
    }

    const sortedAvailable = !pos
      ? available
      : available.sort((a, b) => distance(a.spawn.pos, pos) - distance(b.spawn.pos, pos))

    const nearest = sortedAvailable[0]!
    mobSpawns.push(nearest)
    spawnIdsTaken.add(nearest.spawn.id)
  }

  groupsRemaining = groupsRemaining.map((group) => ({
    ...group,
    mobCounts: mobSpawns.reduce((acc, { mob, spawn }) => {
      const groupId = spawnGroup(spawn)
      if (groupId !== group.id) return acc

      if (!acc[mob.id]) throw new Error(`Mob ${mob.id} not found in group ${group.id}`)

      acc[mob.id] = acc[mob.id]! - 1
      return acc
    }, group.mobCounts),
  }))

  const spawnIds = mobSpawns.map(({ spawn }) => spawn.id)
  return { spawnIds, groupsRemaining, mobEventsRemaining: [] }
}
