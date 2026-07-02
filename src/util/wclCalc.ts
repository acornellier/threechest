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

// Per-event debug trace of what wclCalc did with each raw WCL event, keyed by wclEventKey. Only
// populated when a trace map is passed to wclResultToRoute (used by the WclCoordinateTest overlay).
// No status means the event was still unassigned when the passes ran out (or maxPasses cut off).
export type WclEventTrace = {
  status?: 'assigned' | 'duplicate' | 'alt' | 'no-death' | 'untracked'
  pullIdx?: number
  passName?: string
  posDropped?: 'far-from-spawn' | 'pull-outlier'
}

export type WclTrace = Map<string, WclEventTrace>

export const wclEventKey = (event: {
  gameId: number
  instanceId?: number
  timestamp: number
  mapID?: number
}): string => `${event.gameId}-${event.instanceId ?? 0}-${event.timestamp}-${event.mapID ?? 0}`

function traceMerge(trace: WclTrace | undefined, key: string | undefined, patch: WclEventTrace) {
  if (!trace || !key) {
    return
  }
  trace.set(key, { ...trace.get(key), ...patch })
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

// Cross-pull passes see every pull at once, so they can reason about a group split across adjacent
// pulls. They mutate pullStatuses in place and return the updated groupsRemaining.
type CrossPullArgs = {
  pullStatuses: PullStatus[]
  groupsRemaining: Group[]
  groupMobSpawns: Partial<Record<number | string, MobSpawn[]>>
  spawnIdsTaken: Set<SpawnId>
  trace?: WclTrace
}

type WclPass = {
  name: string
  // run is called once per pull; runAll once with all pulls. Exactly one is set.
  run?: (args: PassArgs) => CalculatedPull | null
  runAll?: (args: CrossPullArgs) => Group[]
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

// Time window for segmenting a pull into sub-pulls (every pass except byWholeGroup). Fixed
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

// A real split is two adjacent pulls at essentially the same spot, so bySplitGroup only claims a
// group sitting right on the pooled leftovers. Tighter than WHOLE_GROUP_MAX_DISTANCE: a far group
// that happens to complete the composition is a coincidence, not a split.
const SPLIT_GROUP_MAX_DISTANCE = 50

// calculateWholeGroupPull's partial fallback (claimed when no single combination of groups covers
// every remaining mob) runs over a whole, unsegmented pull that can span many seconds and — for a
// pull crossing a composite-map seam — skips the singleMap proximity filter on candidate groups
// entirely. Composition alone can then coincidentally match a group whose actual events are
// scattered far away. Each matched event must sit this close to the group to be trusted; same
// reasoning as SPLIT_GROUP_MAX_DISTANCE, a coincidental composition match isn't a real claim.
const CONFIDENT_CLAIM_MAX_DISTANCE = 50

// A gap this large between consecutive events starts a new pull. Shared by the pull builder and the
// map-candidate resolver so both segment events into the same pulls.
const PULL_TIME_GAP = 20_000

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

export function wclResultToRoute(wclResult: WclResult, maxPasses?: number, trace?: WclTrace) {
  const dungeon = dungeons.find((dungeon) => dungeon.wclEncounterId === wclResult.encounterID)

  if (!dungeon) throw new Error(`This WCL dungeon is not yet supported by Threechest.`)

  const errors: string[] = []
  const pulls = wclEventsToPulls(wclResult, dungeon, errors, maxPasses, trace)
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

// altPos is a second plausible position for a seam-ambiguous instance (the mob's other-map
// candidate). Only the group-proximity checks consult it; pull centers and segmentation use pos.
type MobEvent = {
  timestamp: number
  mobId: number
  pos?: Point
  altPos?: Point
  mapID?: number
  key?: string
}

const spawnGroup = (spawn: Spawn) => (spawn.group ? String(spawn.group) : spawn.id)

// The pull-matching passes, run in order. Each tries to assign some of a pull's remaining events to
// MDT groups, returning null to defer to the next. Later passes are looser fallbacks.
export const passes: WclPass[] = [
  // Claim distinctive anchored groups by composition before the sub-pull passes can scatter their
  // members to individual spawns — this rescues a group mis-mapped across a map seam.
  { name: 'byAnchoredGroup', run: calculateAnchoredGroupPullFromSubPulls },
  // Split the pull into sub-pulls and match each to nearby groups (tight, then loose).
  { name: 'bySubPullTight', run: (args) => calculatePullFromSubPulls(args, 10, 10) },
  { name: 'bySubPullLoose', run: (args) => calculatePullFromSubPulls(args, 20, 20) },
  // Cover the leftovers with whole groups by composition (pooled, then per sub-pull).
  { name: 'byWholeGroup', run: calculateWholeGroupPull },
  { name: 'byWholeGroupSubPull', run: calculateWholeGroupPullFromSubPulls },
  // Reunite a group a real run split across two adjacent pulls, so its spawns split cleanly instead
  // of scattering to nearer neighboring groups in byNearestSpawn.
  { name: 'bySplitGroup', runAll: assignSplitGroups },
  // Last resort: assign each remaining mob to its nearest individual spawn.
  { name: 'byNearestSpawn', run: findExactSpawns },
]

function wclEventsToPulls(
  { events, deathEvents }: WclResult,
  dungeon: Dungeon,
  errors: string[],
  maxPasses?: number,
  trace?: WclTrace,
): Pull[] {
  if (!events.length) return []

  const pullMobEvents = getPullMobEvents(events, deathEvents, dungeon, trace)

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
    // are reliable; spanning multiple map ids — or holding a seam-ambiguous mob (one with a second
    // candidate position) — means a mob may sit on a different map than the rest.
    singleMap:
      new Set(mobEvents.map(({ mapID }) => mapID).filter(Boolean)).size <= 1 &&
      !mobEvents.some(({ altPos }) => altPos),
  }))

  let passIdx = 0
  for (const pass of passes) {
    ++passIdx
    if (maxPasses && passIdx > maxPasses) continue

    if (pass.runAll) {
      groupsRemaining = pass.runAll({
        pullStatuses,
        groupsRemaining,
        groupMobSpawns,
        spawnIdsTaken,
        trace,
      })
      continue
    }

    for (let idx = 0; idx < pullStatuses.length; idx++) {
      const pullStatus = pullStatuses[idx]!

      if (pullStatus.complete) continue

      const calculatedPull = pass.run!({
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
        if (trace) {
          // Whatever this pass consumed from the pull is what it assigned.
          const remaining = new Set(calculatedPull.mobEventsRemaining)
          for (const event of pullStatus.mobEventsRemaining) {
            if (!remaining.has(event)) {
              traceMerge(trace, event.key, {
                status: 'assigned',
                pullIdx: idx,
                passName: pass.name,
              })
            }
          }
        }

        groupsRemaining = calculatedPull.groupsRemaining
        pullStatus.spawnIds.push(...calculatedPull.spawnIds)
        pullStatus.mobEventsRemaining = calculatedPull.mobEventsRemaining

        if (pullStatus.mobEventsRemaining.length === 0) pullStatus.complete = true
      }
    }
  }

  if (trace) {
    // Traced pull indices refer to pullStatuses; remap them to the final ids of surviving pulls.
    const finalPullIdx = new Map<number, number>()
    pullStatuses.forEach((pullStatus, idx) => {
      if (pullStatus.spawnIds.length > 0) {
        finalPullIdx.set(idx, finalPullIdx.size)
      }
    })
    for (const entry of trace.values()) {
      if (entry.pullIdx !== undefined) {
        entry.pullIdx = finalPullIdx.get(entry.pullIdx) ?? -1
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

// mobId -> all of that mob's static spawn positions, used to sanity-check WCL event positions.
const spawnPositionsCache = new WeakMap<Dungeon, Map<number, Point[]>>()
function spawnPositionsByMob(dungeon: Dungeon): Map<number, Point[]> {
  const cached = spawnPositionsCache.get(dungeon)
  if (cached) return cached

  const spawnPositions = new Map<number, Point[]>()
  for (const { mob, spawn } of dungeon.mobSpawnsList) {
    const list = spawnPositions.get(mob.id)
    if (list) {
      list.push(spawn.pos)
    } else {
      spawnPositions.set(mob.id, [spawn.pos])
    }
  }

  spawnPositionsCache.set(dungeon, spawnPositions)
  return spawnPositions
}

// Leaflet position of a WCL event, or undefined if it has no usable coordinates.
function eventPos(event: WclEventSimplified, deathEvents: DeathEvent[]): Point | undefined {
  return event.x && event.y && event.mapID && mapBounds[event.mapID]
    ? wclPointToLeafletPoint(event as WclPoint, deathEvents)
    : undefined
}

// The chosen candidate for a mob instance, plus (for a genuinely seam-ambiguous instance) the other
// plausible candidate. winner drives the pull's center/segmentation; alt is offered to the group-
// proximity checks so composition can place the mob on either map, whichever forms a clean cover.
export type ResolvedInstance = { winner: WclEventSimplified; alt?: WclEventSimplified }

// Resolve one instance's candidates. A candidate is "plausible" if it lands near a real spawn of
// that mob; a seam mislabel projects far from any spawn, so it's dropped. The winner is the
// candidate nearest the pull's anchor center (its confidently-placed pull-mates), falling back to
// nearest-spawn. When two candidates are both plausible (the mob type has spawns on both maps) the
// choice is genuinely ambiguous, so we keep the runner-up as alt rather than commit to a map.
function resolveCandidates(
  candidates: WclEventSimplified[],
  anchorCenter: Point | null,
  posOf: (event: WclEventSimplified) => Point | undefined,
  spawnDistOf: (event: WclEventSimplified) => number,
): ResolvedInstance {
  if (candidates.length === 1) return { winner: candidates[0]! }

  const plausible = candidates.filter((c) => spawnDistOf(c) <= MAX_PLAUSIBLE_SPAWN_DISTANCE)
  const pool = plausible.length > 0 ? plausible : candidates

  const rank = anchorCenter
    ? (event: WclEventSimplified) => {
        const pos = posOf(event)
        return pos ? distance(pos, anchorCenter) : Infinity
      }
    : spawnDistOf
  const sorted = [...pool].sort((a, b) => rank(a) - rank(b))

  // Only offer an alt when there's real ambiguity: 2+ candidates both near a spawn. Otherwise the
  // runner-up is just a mislabel and must not be handed to the passes as a valid position.
  return { winner: sorted[0]!, alt: plausible.length >= 2 ? sorted[1] : undefined }
}

// A mob instance near a composite-map seam can be reported on more than one map, so wclRoute emits
// one candidate event per map (all sharing gameId + instanceId). Resolve each instance down to its
// true candidate (plus an alt when ambiguous), using nearby spawns and the instance's pull-mates.
export function resolveInstances(
  events: WclEventSimplified[],
  dungeon: Dungeon,
  deathEvents: DeathEvent[],
): ResolvedInstance[] {
  const spawnPositions = spawnPositionsByMob(dungeon)
  const posOf = (event: WclEventSimplified) => eventPos(event, deathEvents)
  const spawnDistOf = (event: WclEventSimplified): number => {
    const pos = posOf(event)
    return pos ? nearestSpawnDistance(pos, spawnPositions.get(event.gameId)) : Infinity
  }

  // Group candidates by instance, each with a representative (earliest) timestamp.
  const byInstance = groupBy(events, (event) => `${event.gameId}-${event.instanceId}`)
  const instances = Object.values(byInstance).map((candidates) => ({
    candidates: candidates!,
    timestamp: Math.min(...candidates!.map(({ timestamp }) => timestamp)),
  }))
  instances.sort((a, b) => a.timestamp - b.timestamp)

  // Segment instances into pulls by time (candidates of one instance share a timestamp, so they
  // never split), then resolve each pull against the center of its confidently-placed members.
  const resolved: ResolvedInstance[] = []
  let pull: (typeof instances)[number][] = []
  let currentTimestamp = instances[0]?.timestamp ?? 0

  const flushPull = () => {
    const anchorPositions = pull
      .filter(({ candidates }) => candidates.length === 1)
      .map(({ candidates }) => candidates[0]!)
      .filter((event) => spawnDistOf(event) <= MAX_PLAUSIBLE_SPAWN_DISTANCE)
      .map((event) => posOf(event)!)
    const anchorCenter = polygonCenter(anchorPositions)

    for (const { candidates } of pull) {
      resolved.push(resolveCandidates(candidates, anchorCenter, posOf, spawnDistOf))
    }
  }

  for (const instance of instances) {
    if (instance.timestamp - currentTimestamp > PULL_TIME_GAP) {
      flushPull()
      pull = []
    }
    currentTimestamp = instance.timestamp
    pull.push(instance)
  }
  if (pull.length > 0) flushPull()

  return resolved
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
function dropSpatialOutliers(pull: MobEvent[], trace?: WclTrace): MobEvent[] {
  const positions = pull.map(({ pos }) => pos).filter(Boolean) as Point[]
  if (positions.length < 3) return pull

  const center: Point = [median(positions.map((p) => p[0])), median(positions.map((p) => p[1]))]

  return pull.map((event) => {
    if (event.pos && distance(event.pos, center) > PULL_OUTLIER_DISTANCE) {
      traceMerge(trace, event.key, { posDropped: 'pull-outlier' })
      return { ...event, pos: undefined }
    }
    return event
  })
}

function getPullMobEvents(
  events: WclEventSimplified[],
  deathEvents: DeathEvent[],
  dungeon: Dungeon,
  trace?: WclTrace,
): MobEvent[][] {
  const spawnPositions = spawnPositionsByMob(dungeon)

  const trackedEvents = events.filter((event) =>
    dungeon.mobSpawnsList.some(({ mob }) => mob.id === event.gameId),
  )

  const resolved = resolveInstances(trackedEvents, dungeon, deathEvents)
  const altByWinner = new Map<WclEventSimplified, WclEventSimplified>()
  const filteredEvents = resolved.map(({ winner, alt }) => {
    if (alt) altByWinner.set(winner, alt)
    return winner
  })

  if (trace) {
    const tracked = new Set(trackedEvents)
    const winners = new Set(filteredEvents)
    const alts = new Set(altByWinner.values())
    for (const event of events) {
      if (!tracked.has(event)) {
        traceMerge(trace, wclEventKey(event), { status: 'untracked' })
      } else if (alts.has(event)) {
        // Kept as the winner's other-map candidate, not discarded.
        traceMerge(trace, wclEventKey(event), { status: 'alt' })
      } else if (!winners.has(event)) {
        traceMerge(trace, wclEventKey(event), { status: 'duplicate' })
      }
    }
  }

  filteredEvents.sort((a, b) => a.timestamp - b.timestamp)

  const pullMobEvents: MobEvent[][] = []
  const newPull = (): MobEvent[] => []
  let currentPull = newPull()
  let currentTimestamp = filteredEvents[0]!.timestamp

  for (const event of filteredEvents) {
    if (event.timestamp - currentTimestamp > PULL_TIME_GAP) {
      pullMobEvents.push(sanitizePull(dropSpatialOutliers(currentPull, trace), dungeon))
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
      traceMerge(trace, wclEventKey(event), { status: 'no-death' })
      continue
    }

    if (event.mapID && !mapBounds[event.mapID]) {
      console.warn(`Map ID ${event.mapID} bounds missing from mapBounds`)
    }

    const rawPos = eventPos(event, deathEvents)

    // Discard positions that land implausibly far from any spawn of this mob's own type: the
    // event was reported on the wrong WoW map id (a seam between composite maps). Dropping it
    // here also stops the bogus position from fragmenting sub-pulls in getSubPulls.
    const nearestDist = rawPos
      ? nearestSpawnDistance(rawPos, spawnPositions.get(event.gameId))
      : Infinity
    const pos = nearestDist <= MAX_PLAUSIBLE_SPAWN_DISTANCE ? rawPos : undefined
    if (rawPos && !pos) {
      traceMerge(trace, wclEventKey(event), { posDropped: 'far-from-spawn' })
    }

    // A seam-ambiguous mob's other-map candidate, already vetted as plausible by resolveInstances.
    const alt = altByWinner.get(event)
    const altPos = alt ? eventPos(alt, deathEvents) : undefined

    currentTimestamp = event.timestamp
    currentPull.push({
      timestamp: event.timestamp,
      mobId: event.gameId,
      pos,
      altPos,
      mapID: event.mapID,
      key: wclEventKey(event),
    })
  }

  if (currentPull.length > 0)
    pullMobEvents.push(sanitizePull(dropSpatialOutliers(currentPull, trace), dungeon))

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

// Distance from an event to a group; position-less events sort last (consumed only if needed). A
// seam-ambiguous mob uses whichever of its two candidate positions is nearer the group, so
// composition can place it on either map.
const distanceToGroup = (event: MobEvent, group: Group) => {
  let min = event.pos ? distance(event.pos, group.averagePos) : Infinity
  if (event.altPos) min = Math.min(min, distance(event.altPos, group.averagePos))
  return min
}

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
// claims what it confidently can and leaves the rest of the mobs for later passes. Shared by
// calculateAnchoredGroupPull (pre-filtered to anchor-mob groups) and calculateWholeGroupPull's
// fallback (any whole group) when no single combination covers every remaining mob.
function getConfidentGroups(remainingMobs: Record<number, number>, groups: Group[]): Group[] {
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

// Run the anchored-group claim per time-based sub-pull, so a group can only be claimed from — and
// consume — events that died together. Segmentation is time-only (distance ∞): mis-mapping across
// a seam corrupts positions but not timestamps, so the seam-rescue behavior is preserved, while a
// mob that died elsewhere seconds earlier can no longer complete a far group's composition.
function calculateAnchoredGroupPullFromSubPulls({
  mobEvents,
  groupsRemaining,
  groupMobSpawns,
  spawnIdsTaken,
  originalCenter,
  anchorMobIds,
}: PassArgs): CalculatedPull {
  const spawnIds: SpawnId[] = []
  const subPulls = getSubPulls(mobEvents, SUBPULL_TIME_RANGE, Infinity)

  for (const subPull of subPulls) {
    const calculatedPull = calculateAnchoredGroupPull({
      mobEvents: subPull,
      groupsRemaining,
      groupMobSpawns,
      spawnIdsTaken,
      originalCenter,
      anchorMobIds,
    })

    if (calculatedPull !== null) {
      groupsRemaining = calculatedPull.groupsRemaining
      spawnIds.push(...calculatedPull.spawnIds)
      // The claim is partial: drop only the sub-pull events it consumed, keeping the rest of the
      // sub-pull for later passes.
      mobEvents = mobEvents.filter(
        (event) => !subPull.includes(event) || calculatedPull.mobEventsRemaining.includes(event),
      )
    }
  }

  return { spawnIds, groupsRemaining, mobEventsRemaining: mobEvents }
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
}: Pick<
  PassArgs,
  | 'mobEvents'
  | 'groupsRemaining'
  | 'groupMobSpawns'
  | 'spawnIdsTaken'
  | 'originalCenter'
  | 'anchorMobIds'
>): CalculatedPull | null {
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

  const claimedGroups = getConfidentGroups(
    tally(mobEvents, ({ mobId }) => mobId),
    groups,
  )
  if (claimedGroups.length === 0) return null

  const consumedEvents = consumeNearestPerGroup(claimedGroups, mobEvents)
  return claimGroups(
    claimedGroups.map((group) => group.id),
    groupsRemaining,
    groupMobSpawns,
    spawnIdsTaken,
    mobEvents.filter((event) => !consumedEvents.has(event)),
  )
}

// Consume, per mob type, the events nearest each claimed group — so a group takes the events that
// actually sit at its location and leaves events of the same mob elsewhere (with their correct
// positions) for later passes. Groups are processed in the given order, matching the claim order.
function consumeNearestPerGroup(claimedGroups: Group[], mobEvents: MobEvent[]): Set<MobEvent> {
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
  return consumedEvents
}

// Greedily claim whole groups whose composition fits the remaining mob counts AND whose actual
// matching events sit within CONFIDENT_CLAIM_MAX_DISTANCE of the group. Used as
// calculateWholeGroupPull's fallback, which — unlike calculateAnchoredGroupPull — runs over an
// unsegmented pull, so composition alone isn't enough to rule out a scattered coincidence; a group
// is only claimed once its events are confirmed to actually be near it.
function claimConfidentWholeGroups(
  mobCounts: Record<number, number>,
  mobEvents: MobEvent[],
  groups: Group[],
): { claimedGroups: Group[]; consumedEvents: Set<MobEvent> } {
  const claimedGroups: Group[] = []
  const consumedEvents = new Set<MobEvent>()
  const remaining = { ...mobCounts }

  for (const group of groups) {
    const entries = Object.entries(group.mobCounts)
    if (!entries.every(([mobId, count]) => (remaining[Number(mobId)] ?? 0) >= count)) continue

    const matched: MobEvent[] = []
    let withinRange = true
    for (const [mobId, count] of entries) {
      const candidates = mobEvents
        .filter(
          (event) =>
            event.mobId === Number(mobId) &&
            !consumedEvents.has(event) &&
            !matched.includes(event),
        )
        .sort((a, b) => distanceToGroup(a, group) - distanceToGroup(b, group))
        .slice(0, count)

      for (const event of candidates) {
        if (event.pos && distanceToGroup(event, group) > CONFIDENT_CLAIM_MAX_DISTANCE) {
          withinRange = false
        }
        matched.push(event)
      }
    }
    if (!withinRange) continue

    for (const [mobId, count] of entries) remaining[Number(mobId)] -= count
    matched.forEach((event) => consumedEvents.add(event))
    claimedGroups.push(group)
  }

  return { claimedGroups, consumedEvents }
}

// Cover the leftovers with whole groups by composition, preferring larger groups; position is only
// a soft proximity tiebreaker. Reached after the position passes. When one combination of whole
// groups covers every remaining mob exactly, take it. Otherwise (e.g. a same-time singleton boss
// with no matching group mixed in with a swarm that does compose cleanly) fall back to a partial
// claim of whichever whole groups confidently fit, leaving the rest for later passes instead of
// abandoning a clean composition match entirely.
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

  const mobCounts = tally(mobEvents, ({ mobId }) => mobId)

  const pulledGroups = getPulledGroups(mobCounts, groups)
  if (pulledGroups !== null) {
    return claimGroups(pulledGroups, groupsRemaining, groupMobSpawns, spawnIdsTaken, [])
  }

  const { claimedGroups, consumedEvents } = claimConfidentWholeGroups(mobCounts, mobEvents, groups)
  if (claimedGroups.length === 0) return null

  return claimGroups(
    claimedGroups.map((group) => group.id),
    groupsRemaining,
    groupMobSpawns,
    spawnIdsTaken,
    mobEvents.filter((event) => !consumedEvents.has(event)),
  )
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

// Reconstruct a group a real run split across two adjacent pulls. No single pull covers it, so it
// would otherwise fall to byNearestSpawn, which scatters each mob to its own nearest spawn and can
// fragment two groups instead. We pool each adjacent pair's leftovers, claim whole groups the pool
// fully covers (largest first, then nearest), and split each group's spawns back across the two
// pulls by proximity. Only groups both pulls draw from are taken; the rest stay for byNearestSpawn.
function assignSplitGroups({
  pullStatuses,
  groupsRemaining,
  groupMobSpawns,
  spawnIdsTaken,
  trace,
}: CrossPullArgs): Group[] {
  for (let idx = 0; idx < pullStatuses.length - 1; idx++) {
    const pullA = pullStatuses[idx]!
    const pullB = pullStatuses[idx + 1]!

    // A genuine split needs leftovers in both pulls; else the single-pull passes already had a shot.
    if (pullA.mobEventsRemaining.length === 0 || pullB.mobEventsRemaining.length === 0) continue

    const aEvents = new Set(pullA.mobEventsRemaining)
    const pooled = [...pullA.mobEventsRemaining, ...pullB.mobEventsRemaining]
    // Non-consumed pooled events per mob, kept in lockstep with `consumed` for each group's fits-check.
    const remaining = tally(pooled, ({ mobId }) => mobId)

    const pooledPositions = pooled.map(({ pos }) => pos).filter(Boolean) as Point[]
    const center = pooledPositions.length ? polygonCenter(pooledPositions) : null

    const groups = eligibleGroups(groupsRemaining, groupMobSpawns, spawnIdsTaken, pooled)
      .filter((group) => groupSize(group) > 1)
      .sort((a, b) => {
        // Largest first (prefer one whole group over fragmenting several); proximity breaks ties.
        const sizeDiff = groupSize(b) - groupSize(a)
        if (sizeDiff !== 0) return sizeDiff
        if (center === null) return 0
        return distance(a.averagePos, center) - distance(b.averagePos, center)
      })

    const consumed = new Set<MobEvent>()
    const claimedGroupIds: string[] = []

    for (const group of groups) {
      const entries = Object.entries(group.mobCounts)
      // Only claim a group the pool can still fully cover.
      if (!entries.every(([mobId, count]) => (remaining[Number(mobId)] ?? 0) >= count)) continue

      // Tentatively match each count-bearing spawn to the nearest available pooled event of its mob,
      // but only events sitting right on the group — a far event isn't part of this split.
      const groupSpawns = groupMobSpawns[group.id]!
      const usedSpawnIds = new Set<SpawnId>()
      const eventToSpawnId = new Map<MobEvent, SpawnId>()
      const groupConsumed: MobEvent[] = []

      let complete = true
      for (const [mobIdStr, count] of entries) {
        const mobId = Number(mobIdStr)
        const events = pooled
          .filter((e) => e.mobId === mobId && !consumed.has(e) && !groupConsumed.includes(e))
          .filter((e) => distanceToGroup(e, group) < SPLIT_GROUP_MAX_DISTANCE)
          .sort((p, q) => distanceToGroup(p, group) - distanceToGroup(q, group))
          .slice(0, count)

        // Not enough near events to fill the group — this isn't its split, leave it.
        if (events.length < count) {
          complete = false
          break
        }

        for (const event of events) {
          const spawnsOfMob = groupSpawns.filter(
            (ms) => ms.mob.id === mobId && !usedSpawnIds.has(ms.spawn.id),
          )
          const spawn = spawnsOfMob.reduce((best, ms) =>
            distance(ms.spawn.pos, event.pos!) < distance(best.spawn.pos, event.pos!) ? ms : best,
          )
          usedSpawnIds.add(spawn.spawn.id)
          eventToSpawnId.set(event, spawn.spawn.id)
          groupConsumed.push(event)
        }
      }
      if (!complete) continue

      // Require both pulls to contribute; otherwise the group belongs to one pull — leave it.
      const aContributes = groupConsumed.some((e) => aEvents.has(e))
      const bContributes = groupConsumed.some((e) => !aEvents.has(e))
      if (!aContributes || !bContributes) continue

      // Commit: give each consumed event its matched spawn, under its owner pull.
      const aConsumedPositions: Point[] = []
      const bConsumedPositions: Point[] = []
      for (const event of groupConsumed) {
        const ownedByA = aEvents.has(event)
        ;(ownedByA ? pullA : pullB).spawnIds.push(eventToSpawnId.get(event)!)
        consumed.add(event)
        remaining[event.mobId]! -= 1
        if (event.pos) (ownedByA ? aConsumedPositions : bConsumedPositions).push(event.pos)
        traceMerge(trace, event.key, {
          status: 'assigned',
          pullIdx: ownedByA ? idx : idx + 1,
          passName: 'bySplitGroup',
        })
      }

      // Send the group's leftover spawns (count-0 trash) to whichever pull's centroid is nearer.
      const aCenter = aConsumedPositions.length
        ? polygonCenter(aConsumedPositions)
        : pullA.originalCenter
      const bCenter = bConsumedPositions.length
        ? polygonCenter(bConsumedPositions)
        : pullB.originalCenter
      for (const ms of groupSpawns) {
        if (usedSpawnIds.has(ms.spawn.id)) continue
        const toB =
          aCenter === null
            ? bCenter !== null
            : bCenter !== null && distance(ms.spawn.pos, bCenter) < distance(ms.spawn.pos, aCenter)
        ;(toB ? pullB : pullA).spawnIds.push(ms.spawn.id)
        usedSpawnIds.add(ms.spawn.id)
      }

      usedSpawnIds.forEach(spawnIdsTaken.add, spawnIdsTaken)
      claimedGroupIds.push(group.id)
    }

    if (claimedGroupIds.length > 0) {
      pullA.mobEventsRemaining = pullA.mobEventsRemaining.filter((e) => !consumed.has(e))
      pullB.mobEventsRemaining = pullB.mobEventsRemaining.filter((e) => !consumed.has(e))
      if (pullA.mobEventsRemaining.length === 0) pullA.complete = true
      if (pullB.mobEventsRemaining.length === 0) pullB.complete = true
      const claimed = new Set(claimedGroupIds)
      groupsRemaining = groupsRemaining.filter((group) => !claimed.has(group.id))
    }
  }

  return groupsRemaining
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

// Pre-processes groups into numeric-keyed entry arrays and builds a suffix-capacity
// table so the inner search can prune branches that can never satisfy remainingMobs.
function getPulledGroups(remainingMobs: Record<number, number>, groups: Group[]): string[] | null {
  // Convert each group's mobCounts to [number, number][] once to avoid repeated
  // Object.entries + Number() conversions inside the hot recursive loop.
  const groupEntries: [number, number][][] = groups.map((g) =>
    Object.entries(g.mobCounts).map(([k, v]) => [Number(k), v]),
  )

  // suffixCap[i][mobId] = total supply of mobId across groups[i..n-1].
  // Allows O(mob-types) pruning at every node: if any required mob type can't
  // be covered by all remaining groups combined, the branch is dead.
  const suffixCap: Record<number, number>[] = new Array(groups.length + 1)
  suffixCap[groups.length] = {}
  for (let i = groups.length - 1; i >= 0; i--) {
    suffixCap[i] = { ...suffixCap[i + 1] }
    for (const [mobId, count] of groupEntries[i]!) {
      suffixCap[i]![mobId] = (suffixCap[i]![mobId] ?? 0) + count
    }
  }

  const remainingTotal = Object.values(remainingMobs).reduce((a, b) => a + b, 0)
  return searchGroups(remainingMobs, groups, groupEntries, suffixCap, 0, remainingTotal)
}

function searchGroups(
  remainingMobs: Record<number, number>,
  groups: Group[],
  groupEntries: [number, number][][],
  suffixCap: Record<number, number>[],
  groupIdx: number,
  remainingTotal: number,
): string[] | null {
  if (remainingTotal === 0) {
    // no mobs left, solved!
    return []
  }

  if (groupIdx >= groups.length) return null

  // Prune: if the remaining groups don't have enough supply to cover any still-needed mob, bail.
  const cap = suffixCap[groupIdx]!
  for (const [mobIdStr, need] of Object.entries(remainingMobs)) {
    if (need > 0 && (cap[Number(mobIdStr)] ?? 0) < need) return null
  }

  const entries = groupEntries[groupIdx]!
  let isCompatible = true
  let groupTotal = 0
  for (const [mobId, count] of entries) {
    if ((remainingMobs[mobId] ?? 0) - count < 0) {
      isCompatible = false
      break
    }
    groupTotal += count
  }

  if (isCompatible) {
    // Mutate in-place instead of cloning, then backtrack after the recursive call
    for (const [mobId, count] of entries) remainingMobs[mobId] -= count
    const addedGroups = searchGroups(
      remainingMobs,
      groups,
      groupEntries,
      suffixCap,
      groupIdx + 1,
      remainingTotal - groupTotal,
    )
    for (const [mobId, count] of entries) remainingMobs[mobId] += count
    if (addedGroups !== null) {
      return [groups[groupIdx]!.id, ...addedGroups]
    }
  }

  return searchGroups(remainingMobs, groups, groupEntries, suffixCap, groupIdx + 1, remainingTotal)
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
  for (const { mobId, pos, altPos } of mobEvents) {
    const matchingMobs = dungeon.mobSpawnsList.filter(({ mob }) => mob.id === mobId)
    const available = matchingMobs.filter(({ spawn }) => !spawnIdsTaken.has(spawn.id))

    if (available.length === 0) {
      // If it doesn't matter for count just ignore it
      if (matchingMobs.length !== 0 && matchingMobs[0]!.mob.count === 0) continue

      errors.push(`Failed at finding individual matching mob id ${mobId} in pull idx ${idx}`)
      continue
    }

    // Nearest spawn to either candidate position (a seam-ambiguous mob has two).
    const positions = [pos, altPos].filter(Boolean) as Point[]
    const sortedAvailable =
      positions.length === 0
        ? available
        : available.sort(
            (a, b) =>
              nearestSpawnDistance(a.spawn.pos, positions) -
              nearestSpawnDistance(b.spawn.pos, positions),
          )

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
