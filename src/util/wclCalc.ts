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
  instanceId?: number
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
  instanceId?: number
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
  originalCenter: Point | null
  singleMap: boolean
  complete?: boolean
}

type CalculatedPull = {
  spawnIds: SpawnId[]
  groupsRemaining: Group[]
  mobEventsRemaining: MobEvent[]
}

type PassArgs = {
  mobEvents: MobEvent[]
  groupsRemaining: Group[]
  groupMobSpawns: Partial<Record<number | string, MobSpawn[]>>
  spawnIdsTaken: Set<SpawnId>
  dungeon: Dungeon
  idx: number
  originalCenter: Point | null
  anchorMobIds: Set<number>
  singleMap: boolean
  errors: string[]
}

type WclPass = {
  name: string
  run: (args: PassArgs) => CalculatedPull | null
}

export type WclPoint = {
  x: number
  y: number
  timestamp: number
  mapID: number
}

const defaultMapOffsets: MapOffset = {
  x: 0,
  y: 0,
  scaleX: 1,
  scaleY: 1,
}

// A WCL event's reported position can land on the wrong WoW map id when a mob sits near the
// seam between two maps in an MDT composite map. Such a position lands far from any spawn of the
// mob's own type, so we discard it. This sits right at max patrol wander (~30 units), so it can
// occasionally drop a legit patrol position; that fails safe (the mob still resolves by
// composition). TODO: a within-pull outlier check would let us raise this without that risk.
const MAX_PLAUSIBLE_SPAWN_DISTANCE = 60

// Time window for segmenting a pull into sub-pulls (passes 3-4 and the whole-group pass). Fixed
// rather than ramped with the pass: it must stay wide enough that one linked group's deaths —
// which can span a couple of seconds — never split across sub-pulls, while still peeling off a
// mob pulled several seconds later. Separating distinct same-time pulls is the distance knob's
// job, since they're almost always in different locations.
const SUBPULL_TIME_RANGE = 3_000

// A mob "anchors" a group only if it appears in at most this many distinct groups (and never as a
// loose individual). Its presence in a pull then points to one of just a few specific groups, which
// byAnchoredGroup disambiguates by proximity. A common mob spread across many groups (a Windrunner
// Soldier is in 10) pins nothing, so it must not be treated as an anchor.
const MAX_ANCHOR_GROUPS = 3

// A mob whose event position sits this far from the rest of its pull was almost certainly
// mis-mapped to the wrong WoW map id — even if it happens to land near a wrong spawn of its own
// type (which MAX_PLAUSIBLE_SPAWN_DISTANCE can't catch). The composite map is 384x256, so normal
// pull spread is well under this while a cross-map jump is well over it.
const PULL_OUTLIER_DISTANCE = 130

// In a single-map dungeon there is no composite-map seam to mis-map across, so positions are always
// reliable and byWholeGroup must not reach past this distance to complete a cover — otherwise a
// dungeon full of free individual mobs lets a "perfect" group be assembled from spawns all over.
const WHOLE_GROUP_MAX_DISTANCE = 100

const mobsThatDontDie = [231606]

// Change map ID after the death of a specific mob (Magister's Terrace)
const mapTransitions: Array<{ mapId: number; newMapId: number; triggerGameId: number }> = [
  { mapId: 2511, newMapId: 25112511, triggerGameId: 231863 },
  { mapId: 2516, newMapId: 25162516, triggerGameId: 231863 },
]

function resolveMapOffsetId(wclPoint: WclPoint, deathEvents: DeathEvent[]): number {
  const transition = mapTransitions.find((t) => t.mapId === wclPoint.mapID)
  if (!transition) return wclPoint.mapID
  const triggered = deathEvents.some(
    (d) => d.gameId === transition.triggerGameId && d.timestamp <= wclPoint.timestamp,
  )
  return triggered ? transition.newMapId : wclPoint.mapID
}

export const wclPointToLeafletPoint = (wclPoint: WclPoint, deathEvents: DeathEvent[]): Point => {
  const { mapID } = wclPoint
  let { x, y } = wclPoint
  const bounds = mapBounds[mapID]
  if (!bounds) throw new Error(`Map ID ${mapID} bounds not defined.`)

  const { yMin, yMax, xMin, xMax } = bounds
  const mapOffsetMapId = resolveMapOffsetId(wclPoint, deathEvents)
  const mdtMapOffset = mdtMapOffsets[mapOffsetMapId] ?? defaultMapOffsets

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

export function wclResultToRoute(wclResult: WclResult, maxPasses?: number) {
  const dungeon = dungeons.find((dungeon) => dungeon.wclEncounterId === wclResult.encounterID)

  if (!dungeon) throw new Error(`This WCL dungeon is not yet supported by Threechest.`)

  const errors: string[] = []
  const pulls = wclEventsToPulls(wclResult, dungeon, errors, maxPasses)
  const route: Route = {
    uid: `${wclResult.code}-${wclResult.fightId}`,
    name: `WCL ${dungeon.key.toUpperCase()} +${wclResult.keystoneLevel}`,
    dungeonKey: dungeon.key,
    pulls,
    notes: wclResultToNotes(wclResult),
    drawings: [],
    assignments: {},
    wclUrlInfo: {
      code: wclResult.code,
      fightId: wclResult.fightId,
    },
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
        position: wclPointToLeafletPoint(event as WclPoint, wclResult.deathEvents),
      })
      return acc
    }, [])
}

type MobEvent = { timestamp: number; mobId: number; pos?: Point; mapID?: number }

const spawnGroup = (spawn: Spawn) => (spawn.group ? String(spawn.group) : spawn.id)

// The pull-matching passes, run in order. Each tries to assign some of a pull's remaining events to
// MDT groups, returning null to defer to the next. Later passes are looser fallbacks.
export const passes: WclPass[] = [
  // Match the whole pull to nearby groups by position (tight, then loose; loose also allows
  // matching by composition alone when no positions survived).
  { name: 'byPositionTight', run: (args) => calculateExactPull(args, 18, false) },
  { name: 'byPositionLoose', run: (args) => calculateExactPull(args, 36, true) },
  // Claim distinctive anchored groups by composition before the sub-pull passes can scatter their
  // members to individual spawns — this rescues a group mis-mapped across a map seam.
  { name: 'byAnchoredGroup', run: calculateAnchoredGroupPull },
  // Split the pull into sub-pulls and match each to nearby groups (tight, then loose).
  { name: 'bySubPullTight', run: (args) => calculatePullFromSubPulls(args, 10, 10) },
  { name: 'bySubPullLoose', run: (args) => calculatePullFromSubPulls(args, 20, 20) },
  // Cover the leftovers with whole groups by composition (pooled, then per sub-pull).
  { name: 'byWholeGroup', run: calculateWholeGroupPull },
  { name: 'byWholeGroupSubPull', run: calculateWholeGroupPullFromSubPulls },
  // Last resort: assign each remaining mob to its nearest individual spawn.
  { name: 'byNearestSpawn', run: findExactSpawns },
]

function wclEventsToPulls(
  { events, deathEvents }: WclResult,
  dungeon: Dungeon,
  errors: string[],
  maxPasses?: number,
): Pull[] {
  if (!events.length) return []

  const pullMobEvents = getPullMobEvents(events, deathEvents, dungeon)

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
  const anchorMobIds = getAnchorMobIds(dungeon)

  const pullStatuses = pullMobEvents.map<PullStatus>((mobEvents) => ({
    mobEventsRemaining: mobEvents,
    spawnIds: [],
    // Centroid of the pull's reliable positions, captured before passes peel off groups, so it
    // survives as a "borrow location from teammates" hint even when leftovers are position-less.
    originalCenter: polygonCenter(mobEvents.map(({ pos }) => pos).filter(Boolean) as Point[]),
    // A pull confined to one WoW map id can't have crossed a composite-map seam, so its positions
    // are reliable; spanning multiple map ids means a mob may have been mis-mapped across a seam.
    singleMap: new Set(mobEvents.map(({ mapID }) => mapID).filter(Boolean)).size <= 1,
  }))

  let passIdx = 0
  for (const pass of passes) {
    ++passIdx
    if (maxPasses && passIdx > maxPasses) continue
    for (let idx = 0; idx < pullStatuses.length; idx++) {
      const pullStatus = pullStatuses[idx]!

      if (pullStatus.complete) continue

      const calculatedPull = pass.run({
        mobEvents: pullStatus.mobEventsRemaining,
        groupsRemaining,
        groupMobSpawns,
        spawnIdsTaken,
        dungeon,
        idx,
        originalCenter: pullStatus.originalCenter,
        anchorMobIds,
        singleMap: pullStatus.singleMap,
        errors,
      })

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
      spawns: spawnIds.toSorted(),
    }))
}

function nearestSpawnDistance(pos: Point, spawnPositions: Point[] | undefined): number {
  if (!spawnPositions?.length) return Infinity
  let min = Infinity
  for (const spawnPos of spawnPositions) {
    const d = distance(pos, spawnPos)
    if (d < min) min = d
  }
  return min
}

const median = (values: number[]): number => {
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0 ? (sorted[mid - 1]! + sorted[mid]!) / 2 : sorted[mid]!
}

// Drop the position of any event that sits far from the rest of its pull: it was mis-mapped to a
// distant map region but happened to land near a wrong same-type spawn, so the per-event distance
// check kept it. The median center is robust to the outliers themselves. Needs a positioned
// majority (>=3) to tell which event is the outlier.
function dropSpatialOutliers(pull: MobEvent[]): MobEvent[] {
  const positions = pull.map(({ pos }) => pos).filter(Boolean) as Point[]
  if (positions.length < 3) return pull

  const center: Point = [median(positions.map((p) => p[0])), median(positions.map((p) => p[1]))]

  return pull.map((event) => {
    if (event.pos && distance(event.pos, center) > PULL_OUTLIER_DISTANCE) {
      return { ...event, pos: undefined }
    }
    return event
  })
}

function getPullMobEvents(
  events: WclEventSimplified[],
  deathEvents: DeathEvent[],
  dungeon: Dungeon,
): MobEvent[][] {
  // mobId -> all of that mob's static spawn positions, used to sanity-check WCL event positions.
  const spawnPositions = new Map<number, Point[]>()
  for (const { mob, spawn } of dungeon.mobSpawnsList) {
    const list = spawnPositions.get(mob.id)
    if (list) {
      list.push(spawn.pos)
    } else {
      spawnPositions.set(mob.id, [spawn.pos])
    }
  }

  const filteredEvents = events.filter((event) =>
    dungeon.mobSpawnsList.some(({ mob }) => mob.id === event.gameId),
  )

  filteredEvents.sort((a, b) => a.timestamp - b.timestamp)

  const pullMobEvents: MobEvent[][] = []
  const newPull = (): MobEvent[] => []
  let currentPull = newPull()
  let currentTimestamp = filteredEvents[0]!.timestamp

  for (const event of filteredEvents) {
    if (event.timestamp - currentTimestamp > 20_000) {
      pullMobEvents.push(sanitizePull(dropSpatialOutliers(currentPull), dungeon))
      currentPull = newPull()
    }

    if (
      !mobsThatDontDie.includes(event.gameId) &&
      !deathEvents.some(
        (deathEvent) =>
          deathEvent.gameId === event.gameId &&
          deathEvent.instanceId === event.instanceId &&
          deathEvent.timestamp >= event.timestamp,
      )
    ) {
      continue
    }

    if (event.mapID && !mapBounds[event.mapID]) {
      console.warn(`Map ID ${event.mapID} bounds missing from mapBounds`)
    }

    const rawPos =
      event.x && event.y && event.mapID && mapBounds[event.mapID]
        ? wclPointToLeafletPoint(event as WclPoint, deathEvents)
        : undefined

    // Discard positions that land implausibly far from any spawn of this mob's own type: the
    // event was reported on the wrong WoW map id (a seam between composite maps). Dropping it
    // here also stops the bogus position from fragmenting sub-pulls in getSubPulls.
    const nearestDist = rawPos
      ? nearestSpawnDistance(rawPos, spawnPositions.get(event.gameId))
      : Infinity
    const pos = nearestDist <= MAX_PLAUSIBLE_SPAWN_DISTANCE ? rawPos : undefined

    currentTimestamp = event.timestamp
    currentPull.push({
      timestamp: event.timestamp,
      mobId: event.gameId,
      pos,
      mapID: event.mapID,
    })
  }

  if (currentPull.length > 0)
    pullMobEvents.push(sanitizePull(dropSpatialOutliers(currentPull), dungeon))

  return pullMobEvents
}

function sanitizePull(pull: MobEvent[], dungeon: Dungeon): MobEvent[] {
  if (!pull.some((event) => event.mobId === 246285)) return pull

  return dungeon.mobSpawnsList
    .filter((mobSpawn) => [246285, 178394, 178388].includes(mobSpawn.mob.id))
    .map((mobSpawn) => ({
      mobId: mobSpawn.mob.id,
      timestamp: pull[0]!.timestamp,
    }))
}

function calculatePullFromSubPulls(
  { mobEvents, groupsRemaining, groupMobSpawns, spawnIdsTaken }: PassArgs,
  maxDistanceToGroup: number,
  subPullMaxDistance: number,
): CalculatedPull {
  const spawnIds: SpawnId[] = []
  const subPulls = getSubPulls(mobEvents, SUBPULL_TIME_RANGE, subPullMaxDistance)

  for (const subPull of subPulls) {
    const calculatedPull = calculateExactPull(
      {
        mobEvents: subPull,
        groupsRemaining,
        groupMobSpawns,
        spawnIdsTaken,
      },
      maxDistanceToGroup,
      false,
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
  {
    mobEvents: pull,
    groupsRemaining,
    groupMobSpawns,
    spawnIdsTaken,
  }: Pick<PassArgs, 'mobEvents' | 'groupsRemaining' | 'groupMobSpawns' | 'spawnIdsTaken'>,
  maxDistanceToGroup: number,
  allowCompositionOnly: boolean,
): CalculatedPull | null {
  const positions = pull.map(({ pos }) => pos).filter(Boolean)
  if (positions.length === 0 && !allowCompositionOnly) return null

  const pullCenter = polygonCenter(positions)
  let groups = eligibleGroups(groupsRemaining, groupMobSpawns, spawnIdsTaken, pull)
  if (pullCenter !== null) {
    groups = groups
      .filter(({ averagePos }) => distance(averagePos, pullCenter) < maxDistanceToGroup)
      .sort((a, b) => distance(a.averagePos, pullCenter) - distance(b.averagePos, pullCenter))
  }

  const pulledGroups = getPulledGroups(
    tally(pull, ({ mobId }) => mobId),
    groups,
  )
  if (pulledGroups === null) return null
  return claimGroups(pulledGroups, groupsRemaining, groupMobSpawns, spawnIdsTaken, [])
}

const groupSize = (group: Group) =>
  Object.values(group.mobCounts).reduce((total, count) => total + count, 0)

// Distance from an event to a group; position-less events sort last (consumed only if needed).
const distanceToGroup = (event: MobEvent, group: Group) =>
  event.pos ? distance(event.pos, group.averagePos) : Infinity

// Groups still fully available (no spawn taken) that contain a mob present in the pull.
const eligibleGroups = (
  groupsRemaining: Group[],
  groupMobSpawns: Partial<Record<number | string, MobSpawn[]>>,
  spawnIdsTaken: Set<SpawnId>,
  mobEvents: MobEvent[],
) =>
  groupsRemaining
    .filter(({ id }) => !groupMobSpawns[id]!.some(({ spawn }) => spawnIdsTaken.has(spawn.id)))
    .filter(({ mobCounts }) => mobEvents.some(({ mobId }) => (mobCounts[mobId] ?? 0) > 0))

// Take the given groups (mark their spawns as taken) and return the resulting pull.
function claimGroups(
  claimedGroupIds: string[],
  groupsRemaining: Group[],
  groupMobSpawns: Partial<Record<number | string, MobSpawn[]>>,
  spawnIdsTaken: Set<SpawnId>,
  mobEventsRemaining: MobEvent[],
): CalculatedPull {
  const spawnIds = claimedGroupIds.flatMap((id) => groupMobSpawns[id]!.map(({ spawn }) => spawn.id))
  spawnIds.forEach(spawnIdsTaken.add, spawnIdsTaken)
  return {
    spawnIds,
    groupsRemaining: groupsRemaining.filter((group) => !claimedGroupIds.includes(group.id)),
    mobEventsRemaining,
  }
}

// Anchor mobs: those that never appear as a loose, ungrouped spawn AND appear in at most
// MAX_ANCHOR_GROUPS distinct groups. Such a mob's presence in a pull reliably points to one of a
// few specific groups, so byAnchoredGroup can claim the group by composition without stealing loose
// individuals or matching a common mob that's spread across the whole dungeon.
function getAnchorMobIds(dungeon: Dungeon): Set<number> {
  const groupsByMob = new Map<number, Set<string>>()
  const ungroupedMobIds = new Set<number>()
  for (const { mob, spawn } of dungeon.mobSpawnsList) {
    if (!spawn.group) {
      ungroupedMobIds.add(mob.id)
      continue
    }
    const groups = groupsByMob.get(mob.id) ?? new Set<string>()
    groups.add(String(spawn.group))
    groupsByMob.set(mob.id, groups)
  }

  const anchors = new Set<number>()
  for (const [mobId, groups] of groupsByMob) {
    if (!ungroupedMobIds.has(mobId) && groups.size <= MAX_ANCHOR_GROUPS) anchors.add(mobId)
  }
  return anchors
}

// Greedily claim whole groups whose full composition fits in the remaining mob counts, in the given
// (size-desc, proximity) order. Unlike getPulledGroups this is partial: it never fails, it just
// claims what it confidently can and leaves the rest of the mobs for later passes.
function getAnchoredGroups(remainingMobs: Record<number, number>, groups: Group[]): Group[] {
  const claimed: Group[] = []
  const remaining = { ...remainingMobs }

  for (const group of groups) {
    const entries = Object.entries(group.mobCounts)
    if (!entries.every(([mobId, count]) => (remaining[Number(mobId)] ?? 0) >= count)) continue

    for (const [mobId, count] of entries) {
      remaining[Number(mobId)] = (remaining[Number(mobId)] ?? 0) - count
    }
    claimed.push(group)
  }

  return claimed
}

// Claim multi-mob groups pinned by an anchor mob, by composition and ignoring position. Partial:
// only confidently-anchored groups are taken, leaving loose individuals and the rest for later
// passes. Position is only a soft tiebreaker between same-anchor groups.
function calculateAnchoredGroupPull({
  mobEvents,
  groupsRemaining,
  groupMobSpawns,
  spawnIdsTaken,
  originalCenter,
  anchorMobIds,
}: PassArgs): CalculatedPull | null {
  if (mobEvents.length === 0) return null

  const leftoverPositions = mobEvents.map(({ pos }) => pos).filter(Boolean) as Point[]
  const center = leftoverPositions.length ? polygonCenter(leftoverPositions) : originalCenter

  const groups = eligibleGroups(groupsRemaining, groupMobSpawns, spawnIdsTaken, mobEvents)
    .filter((group) => groupSize(group) > 1)
    .filter(({ mobCounts }) => Object.keys(mobCounts).some((id) => anchorMobIds.has(Number(id))))
    .sort((a, b) => {
      // Nearest first: a far "perfect" match is only taken when there's no nearer fit (i.e. the
      // events were genuinely mis-mapped). Size breaks ties when positions are unavailable.
      if (center !== null) {
        const distDiff = distance(a.averagePos, center) - distance(b.averagePos, center)
        if (distDiff !== 0) return distDiff
      }
      return groupSize(b) - groupSize(a)
    })

  const claimedGroups = getAnchoredGroups(
    tally(mobEvents, ({ mobId }) => mobId),
    groups,
  )
  if (claimedGroups.length === 0) return null

  // Consume, per mob type, the events nearest each claimed group — so a group takes the events that
  // actually sit at its location and leaves events of the same mob elsewhere (with their correct
  // positions) for later passes. Groups are processed nearest-first, matching the claim order.
  const consumedEvents = new Set<MobEvent>()
  for (const group of claimedGroups) {
    for (const [mobId, count] of Object.entries(group.mobCounts)) {
      const candidates = mobEvents
        .filter((event) => event.mobId === Number(mobId) && !consumedEvents.has(event))
        .sort((a, b) => distanceToGroup(a, group) - distanceToGroup(b, group))
      for (const event of candidates.slice(0, count)) {
        consumedEvents.add(event)
      }
    }
  }

  return claimGroups(
    claimedGroups.map((group) => group.id),
    groupsRemaining,
    groupMobSpawns,
    spawnIdsTaken,
    mobEvents.filter((event) => !consumedEvents.has(event)),
  )
}

// Cover the leftovers with whole groups by composition, preferring larger groups; position is only
// a soft proximity tiebreaker. Reached after the position passes, so anything with no clean cover
// falls through to findExactSpawns.
function calculateWholeGroupPull({
  mobEvents,
  groupsRemaining,
  groupMobSpawns,
  spawnIdsTaken,
  originalCenter,
  singleMap,
}: Pick<
  PassArgs,
  | 'mobEvents'
  | 'groupsRemaining'
  | 'groupMobSpawns'
  | 'spawnIdsTaken'
  | 'originalCenter'
  | 'singleMap'
>): CalculatedPull | null {
  if (mobEvents.length === 0) return null

  // Borrow a location: prefer leftover positions, fall back to the pull's original centroid.
  const leftoverPositions = mobEvents.map(({ pos }) => pos).filter(Boolean) as Point[]
  const center = leftoverPositions.length ? polygonCenter(leftoverPositions) : originalCenter

  const groups = eligibleGroups(groupsRemaining, groupMobSpawns, spawnIdsTaken, mobEvents)
    // A single-map pull has reliable positions, so don't reach across the map to complete a cover.
    .filter(
      (group) =>
        !singleMap ||
        center === null ||
        distance(group.averagePos, center) < WHOLE_GROUP_MAX_DISTANCE,
    )
    .sort((a, b) => {
      // Largest groups first (prefer whole linked groups); proximity breaks ties.
      const sizeDiff = groupSize(b) - groupSize(a)
      if (sizeDiff !== 0) return sizeDiff
      if (center === null) return 0
      return distance(a.averagePos, center) - distance(b.averagePos, center)
    })

  const pulledGroups = getPulledGroups(
    tally(mobEvents, ({ mobId }) => mobId),
    groups,
  )
  if (pulledGroups === null) return null
  return claimGroups(pulledGroups, groupsRemaining, groupMobSpawns, spawnIdsTaken, [])
}

// When the pooled leftovers have no clean whole-group cover (e.g. one MDT-misgrouped mob, or a
// mob pulled several seconds later), split them into time-based sub-pulls and run the whole-group
// match per sub-pull. Positions are unreliable here, so we split on time only (maxDistance ∞).
// Anything still unresolved falls through to findExactSpawns.
function calculateWholeGroupPullFromSubPulls({
  mobEvents,
  groupsRemaining,
  groupMobSpawns,
  spawnIdsTaken,
  originalCenter,
  singleMap,
}: PassArgs): CalculatedPull {
  const spawnIds: SpawnId[] = []
  const subPulls = getSubPulls(mobEvents, SUBPULL_TIME_RANGE, Infinity)

  for (const subPull of subPulls) {
    const calculatedPull = calculateWholeGroupPull({
      mobEvents: subPull,
      groupsRemaining,
      groupMobSpawns,
      spawnIdsTaken,
      originalCenter,
      singleMap,
    })

    if (calculatedPull !== null) {
      groupsRemaining = calculatedPull.groupsRemaining
      spawnIds.push(...calculatedPull.spawnIds)
      mobEvents = mobEvents.filter((event) => !subPull.includes(event))
    }
  }

  return { spawnIds, groupsRemaining, mobEventsRemaining: mobEvents }
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

function findExactSpawns({
  mobEvents,
  groupsRemaining,
  spawnIdsTaken,
  dungeon,
  errors,
  idx,
}: PassArgs): CalculatedPull | null {
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

    const groupId = spawnGroup(nearest.spawn)
    const groupSiblings = dungeon.mobSpawnsList.filter(
      ({ spawn }) => spawnGroup(spawn) === groupId && !spawnIdsTaken.has(spawn.id),
    )
    if (groupSiblings.every(({ mob }) => mob.count === 0)) {
      for (const sibling of groupSiblings) {
        mobSpawns.push(sibling)
        spawnIdsTaken.add(sibling.spawn.id)
      }
    }
  }

  groupsRemaining = groupsRemaining.map((group) => ({
    ...group,
    mobCounts: mobSpawns.reduce((acc, { mob, spawn }) => {
      const groupId = spawnGroup(spawn)
      if (groupId !== group.id) return acc

      if (!acc[mob.id] && mob.count > 0) {
        throw new Error(`Mob ${mob.id} not found in group ${group.id}`)
      }

      acc[mob.id] = acc[mob.id]! - 1
      return acc
    }, group.mobCounts),
  }))

  const spawnIds = mobSpawns.map(({ spawn }) => spawn.id)
  return { spawnIds, groupsRemaining, mobEventsRemaining: [] }
}
