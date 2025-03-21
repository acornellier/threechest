import type { Note, Pull, Route } from './types.ts'
import type { Dungeon, MobSpawn, Point, Spawn, SpawnId } from '../data/types.ts'
import { dungeons } from '../data/dungeons.ts'
import { distance } from './numbers.ts'
import { groupBy, tally } from './nodash.ts'
import { averagePoint, polygonCenter } from './polygon.ts'
import { mapHeight, mapWidth } from './map.ts'
import { type MapOffset, mdtMapOffsets } from '../data/coordinates/mdtMapOffsets.ts'
import { mapBounds } from '../data/coordinates/mapBounds.ts'

export type WclEventBase = {
  timestamp: number
  x?: number
  y?: number
  mapID?: number
}

export type WclEventSimplified = WclEventBase & {
  gameId: number
  name: string
  id?: number
}

export type WclDeathEvent = {
  timestamp: number
  targetID: number
  targetInstance?: number
}

export type DeathEvent = {
  timestamp: number
  gameId: number
}

export type WclResult = WclUrlInfo & {
  encounterID: number
  keystoneLevel: number
  events: WclEventSimplified[]
  lustEvents: WclEventBase[]
  deathEvents: DeathEvent[]
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

type Pass = 1 | 2 | 3 | 4 | 5

export type WclPoint = {
  x: number
  y: number
  mapID: number
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
  const mdtMapOffset = mdtMapOffsets[mapID] ?? defaultMapOffsets

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

export function wclResultToRoute(wclResult: WclResult) {
  const dungeon = dungeons.find((dungeon) => dungeon.wclEncounterId === wclResult.encounterID)

  if (!dungeon) throw new Error(`This WCL dungeon is not yet supported by Threechest.`)

  const errors: string[] = []
  const pulls = wclEventsToPulls(wclResult, dungeon, errors)
  const route: Route = {
    uid: `${wclResult.code}-${wclResult.fightId}`,
    name: `WCL ${dungeon.key.toUpperCase()} +${wclResult.keystoneLevel}`,
    dungeonKey: dungeon.key,
    pulls,
    notes: wclResultToNotes(wclResult),
    drawings: [],
  }

  return {
    route,
    errors,
  }
}

function wclResultToNotes(wclResult: WclResult): Note[] {
  let lastLustTimestamp = -Infinity
  return wclResult.lustEvents
    .filter((event) => event.x && event.y && event.mapID)
    .reduce<Note[]>((acc, event) => {
      if (event.timestamp - lastLustTimestamp < 10_000) return acc

      lastLustTimestamp = event.timestamp
      acc.push({
        text: 'Lust',
        position: wclPointToLeafletPoint({ x: event.x!, y: event.y!, mapID: event.mapID! }),
      })
      return acc
    }, [])
}

type MobEvent = { timestamp: number; mobId: number; pos?: Point }

const spawnGroup = (spawn: Spawn) => (spawn.group ? String(spawn.group) : spawn.id)

function wclEventsToPulls(
  { events, deathEvents }: WclResult,
  dungeon: Dungeon,
  errors: string[],
): Pull[] {
  if (!events.length) return []

  const pullMobIds = getPullMobIds(events, deathEvents, dungeon)

  const groupMobSpawns = groupBy(dungeon.mobSpawnsList, ({ spawn }) => spawnGroup(spawn))

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

  for (const pass of [1, 2, 3, 4, 5] as const) {
    for (let idx = 0; idx < pullStatuses.length; idx++) {
      const pullStatus = pullStatuses[idx]!

      if (pullStatus.complete) continue

      const calculatedPull = calculatePull(
        pullStatus.mobEventsRemaining,
        groupsRemaining,
        groupMobSpawns,
        spawnIdsTaken,
        dungeon,
        idx,
        pass,
        errors,
      )

      if (calculatedPull !== null) {
        groupsRemaining = calculatedPull.groupsRemaining
        pullStatus.spawnIds.push(...calculatedPull.spawnIds)
        pullStatus.mobEventsRemaining = calculatedPull.mobEventsRemaining

        if (pullStatus.mobEventsRemaining.length === 0) pullStatus.complete = true
      }
    }
  }

  return pullStatuses
    .filter((pullStatus) => pullStatus.spawnIds.length > 0)
    .map<Pull>(({ spawnIds }, idx) => ({
      id: idx,
      spawns: spawnIds,
    }))
}

function getPullMobIds(events: WclEventSimplified[], deathEvents: DeathEvent[], dungeon: Dungeon) {
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

    if (
      !deathEvents.some(
        (deathEvent) =>
          deathEvent.gameId === event.gameId && deathEvent.timestamp >= event.timestamp,
      )
    ) {
      continue
    }

    if (event.mapID && !mapBounds[event.mapID]) {
      console.warn(`Map ID ${event.mapID} bounds missing from mapBounds`)
    }

    currentTimestamp = event.timestamp
    currentPull.push({
      timestamp: event.timestamp,
      mobId: event.gameId,
      pos:
        event.x && event.y && event.mapID && mapBounds[event.mapID]
          ? wclPointToLeafletPoint({ x: event.x, y: event.y, mapID: event.mapID })
          : undefined,
    })
  }

  if (currentPull.length > 0) pullMobIds.push(currentPull)

  return pullMobIds
}

function calculatePull(
  mobEvents: MobEvent[],
  groupsRemaining: Group[],
  groupMobSpawns: Partial<Record<number | string, MobSpawn[]>>,
  spawnIdsTaken: Set<SpawnId>,
  dungeon: Dungeon,
  idx: number,
  pass: Pass,
  errors: string[],
): CalculatedPull | null {
  if (pass <= 2) {
    return calculatePullFromSubPulls(
      mobEvents,
      groupsRemaining,
      groupMobSpawns,
      spawnIdsTaken,
      pass,
    )
  } else if (pass <= 4) {
    return calculateExactPull(mobEvents, groupsRemaining, groupMobSpawns, spawnIdsTaken, pass, 80)
  } else {
    return findExactSpawns(mobEvents, groupsRemaining, spawnIdsTaken, dungeon, errors, idx)
  }
}

function calculatePullFromSubPulls(
  mobEvents: MobEvent[],
  groupsRemaining: Group[],
  groupMobSpawns: Partial<Record<number | string, MobSpawn[]>>,
  spawnIdsTaken: Set<SpawnId>,
  pass: Pass,
) {
  const maxDistanceToGroup = pass * 10
  const subPullTimestampRange = pass * 1_000
  const subPullMaxDistance = pass * 10

  const spawnIds: SpawnId[] = []
  const subPulls = getSubPulls(mobEvents, subPullTimestampRange, subPullMaxDistance)

  for (const subPull of subPulls) {
    const calculatedPull = calculateExactPull(
      subPull,
      groupsRemaining,
      groupMobSpawns,
      spawnIdsTaken,
      pass,
      maxDistanceToGroup,
    )

    if (calculatedPull !== null) {
      groupsRemaining = calculatedPull.groupsRemaining
      spawnIds.push(...calculatedPull.spawnIds)
      mobEvents = mobEvents.filter((event) => !subPull.includes(event))
    }
  }

  return { spawnIds, groupsRemaining, mobEventsRemaining: mobEvents }
}

function calculateExactPull(
  pull: MobEvent[],
  groupsRemaining: Group[],
  groupMobSpawns: Partial<Record<number | string, MobSpawn[]>>,
  spawnIdsTaken: Set<SpawnId>,
  pass: Pass,
  maxDistanceToGroup: number,
): CalculatedPull | null {
  const filteredPositions = pull.map(({ pos }) => pos).filter(Boolean)
  if (filteredPositions.length === 0 && pass < 4) return null

  const pullCenter = polygonCenter(filteredPositions)
  const pullMobCounts = tally(pull, ({ mobId }) => mobId)

  let groups = groupsRemaining
    .filter(({ id }) => !groupMobSpawns[id]!.some(({ spawn }) => spawnIdsTaken.has(spawn.id)))
    .filter(({ mobCounts }) => pull.some(({ mobId }) => (mobCounts[mobId] ?? 0) > 0))

  if (pass < 4 && pullCenter !== null) {
    groups = groups
      .filter(
        ({ averagePos }) => pass >= 4 || distance(averagePos, pullCenter!) < maxDistanceToGroup,
      )
      .sort((a, b) => distance(a.averagePos, pullCenter) - distance(b.averagePos, pullCenter))
  }

  const pulledGroups = getPulledGroups(pullMobCounts, groups)
  if (pulledGroups === null) return null

  const spawnIds = pulledGroups.flatMap((groupId) =>
    groupMobSpawns[groupId]!.map(({ spawn }) => spawn.id),
  )

  groupsRemaining = groupsRemaining.filter((group) => !pulledGroups.includes(group.id))

  spawnIds.forEach(spawnIdsTaken.add, spawnIdsTaken)
  return { spawnIds, groupsRemaining, mobEventsRemaining: [] }
}

function getSubPulls(mobEvents: MobEvent[], maxTime: number, maxDistance: number) {
  const firstEvent = mobEvents[0]
  if (!firstEvent) return []

  const subPulls: MobEvent[][] = []
  let currentSubPull: MobEvent[] = []
  let currentTimestamp = firstEvent.timestamp
  let currentPos = firstEvent.pos

  for (const event of mobEvents) {
    if (
      event.timestamp - currentTimestamp > maxTime ||
      (event.pos && currentPos && distance(event.pos, currentPos) > maxDistance)
    ) {
      subPulls.push(currentSubPull)
      currentSubPull = []
    }

    currentTimestamp = event.timestamp
    if (event.pos) currentPos = event.pos
    currentSubPull.push(event)
  }

  if (currentSubPull.length > 0) subPulls.push(currentSubPull)

  return subPulls.filter((subPull) => subPull.length > 1)
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
  mobEvents: MobEvent[],
  groupsRemaining: Group[],
  spawnIdsTaken: Set<SpawnId>,
  dungeon: Dungeon,
  errors: string[],
  idx: number,
): CalculatedPull | null {
  const mobSpawns: MobSpawn[] = []
  for (const { mobId, pos } of mobEvents) {
    const matchingMobs = dungeon.mobSpawnsList.filter(({ mob }) => mob.id === mobId)
    const available = matchingMobs.filter(({ spawn }) => !spawnIdsTaken.has(spawn.id))

    if (available.length === 0) {
      // If it doesn't matter for count just ignore it
      if (matchingMobs.length !== 0 && matchingMobs[0]!.mob.count === 0) continue

      errors.push(`Failed at finding individual matching mob id ${mobId} in pull idx ${idx}`)
      continue
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
