// Converts a Warcraft Logs fight into a Threechest route: which MDT spawns died in which pull.
//
// Pipeline:
//   1. Project event coordinates onto the MDT map (wclPointToLeafletPoint).
//   2. A mob near the seam of an MDT composite map is often reported on the wrong WoW map, so
//      resolve per-map duplicate events into one instance each and drop implausible positions
//      (resolveInstances, getPullMobEvents).
//   3. Segment events into pulls by time gap.
//   4. Match each pull's events to MDT spawn groups with a series of passes (see `passes`), from
//      strictest to loosest, sharing a MatchState so each spawn is claimed exactly once.
//
// Positions are noisy and sometimes lies; group composition (which mob types died together) is the
// strongest signal. Most passes match by composition, using position as a filter or tiebreaker.

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
  actorId?: number
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

// Per-event debug trace, keyed by wclEventKey; populated when a trace map is passed to
// wclResultToRoute (the WclCoordinateTest overlay). No status = still unassigned after all passes.
export type WclEventTrace = {
  status?: 'assigned' | 'duplicate' | 'alt' | 'no-death' | 'untracked'
  pullIdx?: number
  passName?: string
  posDropped?: 'far-from-spawn' | 'pull-outlier'
}

export type WclTrace = Map<string, WclEventTrace>

export const wclEventKey = (event: {
  actorId?: number
  instanceId?: number
  timestamp: number
  mapID?: number
}): string =>
  `${event.actorId ?? 0}-${event.instanceId ?? 0}-${event.timestamp}-${event.mapID ?? 0}`

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
  mobEventsRemaining: MobEvent[]
}

type PassArgs = {
  state: MatchState
  pullStatus: PullStatus
  idx: number
}

// Cross-pull passes see every pull at once, so they can reason about a group split across adjacent
// pulls. They mutate pullStatuses (and the match state) in place.
type CrossPullArgs = {
  state: MatchState
  pullStatuses: PullStatus[]
  trace?: WclTrace
}

type WclPass = {
  name: string
  // run is called once per pull; runAll once with all pulls. Exactly one is set.
  run?: (args: PassArgs) => CalculatedPull | null
  runAll?: (args: CrossPullArgs) => void
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

// A position farther than this from any spawn of the event's own mob type was reported on the
// wrong map (seam mislabel) and is discarded. Comfortably above max patrol wander (~30 units);
// dropping a legit patrol position fails safe — the mob still resolves by composition.
const MAX_PLAUSIBLE_SPAWN_DISTANCE = 60

// Time window for segmenting a pull into sub-pulls. Wide enough that one linked group's deaths
// (which can span a couple of seconds) never split, while still peeling off a mob pulled later.
// Separating distinct same-time pulls is the distance knob's job.
const SUBPULL_TIME_RANGE = 3_000

// A mob "anchors" a group only if it appears in at most this many groups (and never ungrouped),
// so its presence pins the pull to a few specific groups. A common mob pins nothing (a Windrunner
// Soldier is in 10 groups) and must not anchor.
const MAX_ANCHOR_GROUPS = 3

// An event this far from the rest of its pull was mis-mapped even though it landed near a wrong
// same-type spawn (which MAX_PLAUSIBLE_SPAWN_DISTANCE can't catch). Normal pull spread is well
// under this; a cross-map jump is well over.
const PULL_OUTLIER_DISTANCE = 130

// A single-map pull has no seam, so its positions are reliable and byComposition must not reach
// past this to complete a cover — else a "perfect" group can be assembled from mobs all over.
const COMPOSITION_MAX_DISTANCE = 50

// byAnchoredGroup ignores position to rescue seam-mis-mapped groups, but a single-map pull has no
// seam — a far "perfect" anchored match there is a coincidence that steals events from nearer
// groups. Cap its reach in that case.
const ANCHORED_GROUP_MAX_DISTANCE = 40

// A real split is two adjacent pulls at essentially the same spot, so bySplitGroup only claims a
// group sitting right on the pooled leftovers; a far group that happens to complete the
// composition is a coincidence, not a split.
const SPLIT_GROUP_MAX_DISTANCE = 50

// calculateCompositionPull's partial fallback runs over a whole, unsegmented pull and (on seam
// pulls) without the proximity filter, so composition alone can coincidentally match a group whose
// events are scattered far away. Each matched event must sit this close to be trusted.
const CONFIDENT_CLAIM_MAX_DISTANCE = 50

// hasNearerEligibleGroup's margin. Must exceed the spread of densely packed same-type groups
// (adjacent packs put an event nearly equidistant from several groups, ~7 units apart) while still
// catching a seam-mislabeled mob whose true position is tens of units nearer a different group.
const CONFIDENT_CLAIM_NEARER_MARGIN = 20

// A gap this large between consecutive events starts a new pull.
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

// altPos is a seam-ambiguous instance's other-map candidate position. Only the group-proximity
// checks consult it; pull centers and segmentation use pos.
type MobEvent = {
  timestamp: number
  mobId: number
  pos?: Point
  altPos?: Point
  mapID?: number
  key?: string
}

const spawnGroup = (spawn: Spawn) => (spawn.group ? String(spawn.group) : spawn.id)

// The shared matching state for one route calculation. claimGroups keeps the core invariant — a
// group leaves groupsRemaining exactly when its spawns enter spawnIdsTaken — in one place.
class MatchState {
  groupsRemaining: Group[]
  readonly spawnIdsTaken = new Set<SpawnId>()
  readonly groupMobSpawns: Partial<Record<number | string, MobSpawn[]>>
  readonly anchorMobIds: Set<number>

  constructor(
    readonly dungeon: Dungeon,
    readonly errors: string[],
  ) {
    this.groupMobSpawns = groupBy(dungeon.mobSpawnsList, ({ spawn }) => spawnGroup(spawn))
    this.anchorMobIds = getAnchorMobIds(dungeon)
    this.groupsRemaining = Object.entries(this.groupMobSpawns).map<Group>(
      ([groupId, mobSpawns]) => {
        const nonZeroCountMobSpawns = mobSpawns!.filter(({ mob }) => mob.count > 0 || mob.isBoss)
        return {
          id: groupId,
          mobCounts: tally(nonZeroCountMobSpawns, ({ mob }) => mob.id),
          averagePos: averagePoint(nonZeroCountMobSpawns.map(({ spawn }) => spawn.pos)),
        }
      },
    )
  }

  // Groups still fully available (no spawn taken) that contain a mob present in the pull.
  eligibleGroups(mobEvents: MobEvent[]): Group[] {
    return this.groupsRemaining
      .filter(
        ({ id }) => !this.groupMobSpawns[id]!.some(({ spawn }) => this.spawnIdsTaken.has(spawn.id)),
      )
      .filter(({ mobCounts }) => mobEvents.some(({ mobId }) => (mobCounts[mobId] ?? 0) > 0))
  }

  // Remove the given groups from play, mark their spawns taken, and return the resulting pull.
  claimGroups(claimedGroupIds: string[], mobEventsRemaining: MobEvent[]): CalculatedPull {
    const spawnIds = claimedGroupIds.flatMap((id) =>
      this.groupMobSpawns[id]!.map(({ spawn }) => spawn.id),
    )
    spawnIds.forEach((id) => this.spawnIdsTaken.add(id))
    this.groupsRemaining = this.groupsRemaining.filter(
      (group) => !claimedGroupIds.includes(group.id),
    )
    return { spawnIds, mobEventsRemaining }
  }
}

// The pull-matching passes, run in order. Each tries to assign some of a pull's remaining events to
// MDT groups, returning null to defer to the next. Later passes are looser fallbacks.
export const passes: WclPass[] = [
  // Claim distinctive anchored groups by composition before the position passes can scatter their
  // members — this rescues a group mis-mapped across a map seam.
  { name: 'byAnchoredGroup', run: calculateAnchoredGroupPullFromSubPulls },
  // Match each sub-pull to the groups sitting on it (tight, then loose radius).
  { name: 'byProximityTight', run: (args) => calculateProximityPullFromSubPulls(args, 10, 10) },
  { name: 'byProximityLoose', run: (args) => calculateProximityPullFromSubPulls(args, 20, 20) },
  // Cover the leftovers with whole groups by composition (pooled, then per sub-pull).
  {
    name: 'byComposition',
    run: ({ state, pullStatus }) =>
      calculateCompositionPull(state, pullStatus.mobEventsRemaining, pullStatus),
  },
  { name: 'byCompositionSubPull', run: calculateCompositionPullFromSubPulls },
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

  const state = new MatchState(dungeon, errors)

  const pullStatuses = pullMobEvents.map<PullStatus>((mobEvents) => ({
    mobEventsRemaining: mobEvents,
    spawnIds: [],
    // Captured before passes peel off groups; position-less leftovers borrow it later.
    originalCenter: polygonCenter(mobEvents.map(({ pos }) => pos).filter(Boolean) as Point[]),
    // One map id and no seam-ambiguous mob means the pull can't have crossed a seam, so its
    // positions are reliable.
    singleMap:
      new Set(mobEvents.map(({ mapID }) => mapID).filter(Boolean)).size <= 1 &&
      !mobEvents.some(({ altPos }) => altPos),
  }))

  let passIdx = 0
  for (const pass of passes) {
    ++passIdx
    if (maxPasses && passIdx > maxPasses) continue

    if (pass.runAll) {
      pass.runAll({ state, pullStatuses, trace })
      continue
    }

    for (let idx = 0; idx < pullStatuses.length; idx++) {
      const pullStatus = pullStatuses[idx]!

      if (pullStatus.complete) continue

      const calculatedPull = pass.run!({ state, pullStatus, idx })

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

// The chosen candidate for a mob instance, plus (when genuinely seam-ambiguous) the other
// plausible candidate, so composition can later place the mob on whichever map forms a clean cover.
export type ResolvedInstance = { winner: WclEventSimplified; alt?: WclEventSimplified }

// Pick an instance's winner: the plausible candidate (near a real spawn of its mob) nearest the
// pull's anchor center, falling back to nearest-spawn. When two candidates are both plausible (the
// mob type has spawns on both maps) keep the runner-up as alt rather than commit to a map.
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

  // Without 2+ plausible candidates the runner-up is just a mislabel, not a valid position.
  return { winner: sorted[0]!, alt: plausible.length >= 2 ? sorted[1] : undefined }
}

// A mob instance near a seam can be reported on more than one map, so wclRoute emits one candidate
// event per map (sharing gameId + instanceId). Resolve each instance down to its true candidate.
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
  const byInstance = groupBy(events, (event) => `${event.actorId}-${event.instanceId}`)
  const instances = Object.values(byInstance).map((candidates) => ({
    candidates: candidates!,
    timestamp: Math.min(...candidates!.map(({ timestamp }) => timestamp)),
  }))
  instances.sort((a, b) => a.timestamp - b.timestamp)

  // Segment instances into pulls by time, then resolve each pull against the center of its
  // confidently-placed members.
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

// Drop the position of any event far from the rest of its pull: mis-mapped, but near a wrong
// same-type spawn so the per-event check kept it. The median center is robust to the outliers
// themselves; needs >=3 positions to tell which event is the outlier.
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

    // Discard seam-mislabeled positions here so they can't fragment sub-pulls in getSubPulls.
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

// Segment a pull's events into time/distance sub-pulls and run an inner pass on each. An inner
// pass may claim only part of its sub-pull; the unconsumed events are kept for later passes.
function runPerSubPull(
  mobEvents: MobEvent[],
  subPullMaxDistance: number,
  runSubPull: (subPull: MobEvent[]) => CalculatedPull | null,
): CalculatedPull {
  const spawnIds: SpawnId[] = []
  const subPulls = getSubPulls(mobEvents, SUBPULL_TIME_RANGE, subPullMaxDistance)

  for (const subPull of subPulls) {
    const calculatedPull = runSubPull(subPull)
    if (calculatedPull === null) continue

    spawnIds.push(...calculatedPull.spawnIds)
    mobEvents = mobEvents.filter(
      (event) => !subPull.includes(event) || calculatedPull.mobEventsRemaining.includes(event),
    )
  }

  return { spawnIds, mobEventsRemaining: mobEvents }
}

function calculateProximityPullFromSubPulls(
  { state, pullStatus }: PassArgs,
  maxDistanceToGroup: number,
  subPullMaxDistance: number,
): CalculatedPull {
  return runPerSubPull(pullStatus.mobEventsRemaining, subPullMaxDistance, (subPull) =>
    calculateProximityPull(state, subPull, maxDistanceToGroup),
  )
}

function calculateProximityPull(
  state: MatchState,
  pull: MobEvent[],
  maxDistanceToGroup: number,
): CalculatedPull | null {
  const positions = pull.map(({ pos }) => pos).filter(Boolean)
  if (positions.length === 0) return null

  const pullCenter = polygonCenter(positions)
  let groups = state.eligibleGroups(pull)
  if (pullCenter !== null) {
    groups = groups
      .filter(({ averagePos }) => distance(averagePos, pullCenter) < maxDistanceToGroup)
      // Rank by proximity to the events a group would actually claim, not to the pooled center: a
      // sub-pull spanning two clusters puts the center between them, and getPulledGroups takes the
      // first composition-valid cover in this order, so a center rank can pick a coincidental
      // cover over the group the events sit on.
      .sort(
        (a, b) =>
          nearestCoveredEventDistance(a, pull, pullCenter) -
          nearestCoveredEventDistance(b, pull, pullCenter),
      )
  }

  const pulledGroups = getPulledGroups(
    tally(pull, ({ mobId }) => mobId),
    groups,
  )
  if (pulledGroups === null) return null
  return state.claimGroups(pulledGroups, [])
}

const groupSize = (group: Group) =>
  Object.values(group.mobCounts).reduce((total, count) => total + count, 0)

// Distance from an event to a group; position-less events sort last. A seam-ambiguous mob uses
// whichever of its two candidate positions is nearer, so composition can place it on either map.
const distanceToGroup = (event: MobEvent, group: Group) => {
  let min = event.pos ? distance(event.pos, group.averagePos) : Infinity
  if (event.altPos) min = Math.min(min, distance(event.altPos, group.averagePos))
  return min
}

// Whether the pool's mob counts can cover the group's full composition. A group that can't form
// from the pool is a phantom competitor: it sits nearby but can never actually claim anything.
const groupFitsPool = (group: Group, poolCounts: Record<number, number>): boolean =>
  Object.entries(group.mobCounts).every(
    ([mobId, count]) => (poolCounts[Number(mobId)] ?? 0) >= count,
  )

// True when another formable group (see groupFitsPool) sits markedly nearer this event — the event
// physically belongs to that group, so `group` claiming it would be a coincidental composition
// fit. The margin keeps this from misfiring on densely packed same-type groups, where an event
// legitimately sits nearly equidistant from several. Position-less events never trigger it.
const hasNearerEligibleGroup = (
  event: MobEvent,
  group: Group,
  groups: Group[],
  poolCounts?: Record<number, number>,
): boolean => {
  if (!event.pos && !event.altPos) return false
  const distToGroup = distanceToGroup(event, group)
  return groups.some(
    (other) =>
      other !== group &&
      (!poolCounts || groupFitsPool(other, poolCounts)) &&
      distanceToGroup(event, other) < distToGroup - CONFIDENT_CLAIM_NEARER_MARGIN,
  )
}

// Distance from a group to the nearest event whose mob the group contains — how well it sits on
// the events it'd claim. Falls back to the pull center when no covered event is positioned.
const nearestCoveredEventDistance = (
  group: Group,
  mobEvents: MobEvent[],
  center: Point | null,
): number => {
  let min = Infinity
  for (const event of mobEvents) {
    if ((group.mobCounts[event.mobId] ?? 0) > 0) {
      min = Math.min(min, distanceToGroup(event, group))
    }
  }
  if (min !== Infinity) return min
  return center ? distance(group.averagePos, center) : 0
}

// Mobs that never spawn ungrouped and appear in at most MAX_ANCHOR_GROUPS groups, so their
// presence in a pull reliably points to specific groups.
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

// Vetoes for matchGroupToEvents, each guarding against a coincidental composition fit — a group
// whose mob counts happen to match events that don't actually belong to it.
type GroupMatchOptions = {
  // Veto when a matched positioned event sits farther than this from the group.
  maxEventDistance?: number
  // Stricter: consider only events within maxEventDistance and require the full composition to be
  // filled by them — a position-less event can't fill a slot.
  requireNearEvents?: boolean
  // Veto when a matched event belongs to a markedly nearer formable group (hasNearerEligibleGroup).
  vetoNearerGroups?: Group[]
  vetoPoolCounts?: Record<number, number>
}

// The core claim matcher: pick, per mob type in the group's composition, the group's `count`
// nearest available events — the events the group would consume if claimed. Null when a veto fires.
function matchGroupToEvents(
  group: Group,
  pool: MobEvent[],
  isConsumed: (event: MobEvent) => boolean,
  options: GroupMatchOptions = {},
): MobEvent[] | null {
  const { maxEventDistance, requireNearEvents, vetoNearerGroups, vetoPoolCounts } = options
  const matched: MobEvent[] = []

  for (const [mobIdStr, count] of Object.entries(group.mobCounts)) {
    const mobId = Number(mobIdStr)
    let candidates = pool.filter(
      (event) => event.mobId === mobId && !isConsumed(event) && !matched.includes(event),
    )
    if (requireNearEvents) {
      candidates = candidates.filter((event) => distanceToGroup(event, group) < maxEventDistance!)
    }
    candidates.sort((a, b) => distanceToGroup(a, group) - distanceToGroup(b, group))

    const taken = candidates.slice(0, count)
    if (requireNearEvents && taken.length < count) return null

    for (const event of taken) {
      if (
        !requireNearEvents &&
        (event.pos || event.altPos) &&
        ((maxEventDistance !== undefined && distanceToGroup(event, group) > maxEventDistance) ||
          (vetoNearerGroups &&
            hasNearerEligibleGroup(event, group, vetoNearerGroups, vetoPoolCounts)))
      ) {
        return null
      }
      matched.push(event)
    }
  }

  return matched
}

// Greedily claim, in the given order, whole groups whose composition fits the remaining mob
// counts, consuming each group's nearest events. Unlike getPulledGroups this is partial: it claims
// what it confidently can and leaves the rest for later passes; a vetoed group is skipped.
function claimFittingGroups(
  mobCounts: Record<number, number>,
  mobEvents: MobEvent[],
  groups: Group[],
  options: GroupMatchOptions = {},
): { claimedGroups: Group[]; consumedEvents: Set<MobEvent> } {
  const claimedGroups: Group[] = []
  const consumedEvents = new Set<MobEvent>()
  const remaining = { ...mobCounts }

  for (const group of groups) {
    if (!groupFitsPool(group, remaining)) continue

    const matched = matchGroupToEvents(
      group,
      mobEvents,
      (event) => consumedEvents.has(event),
      options,
    )
    if (matched === null) continue

    for (const [mobId, count] of Object.entries(group.mobCounts)) {
      remaining[Number(mobId)] = (remaining[Number(mobId)] ?? 0) - count
    }
    matched.forEach((event) => consumedEvents.add(event))
    claimedGroups.push(group)
  }

  return { claimedGroups, consumedEvents }
}

// Run the anchored-group claim per sub-pull, so a group can only consume events that died
// together. Segmentation is time-only (distance ∞): a seam corrupts positions but not timestamps,
// so the seam rescue survives while a mob that died elsewhere can't complete a far composition.
function calculateAnchoredGroupPullFromSubPulls({ state, pullStatus }: PassArgs): CalculatedPull {
  return runPerSubPull(pullStatus.mobEventsRemaining, Infinity, (subPull) =>
    calculateAnchoredGroupPull(state, subPull, pullStatus),
  )
}

// Claim multi-mob groups pinned by an anchor mob, by composition and ignoring position (which is
// only a soft tiebreaker between same-anchor groups). Partial: the rest stays for later passes.
function calculateAnchoredGroupPull(
  state: MatchState,
  mobEvents: MobEvent[],
  { originalCenter, singleMap }: Pick<PullStatus, 'originalCenter' | 'singleMap'>,
): CalculatedPull | null {
  if (mobEvents.length === 0) return null

  const leftoverPositions = mobEvents.map(({ pos }) => pos).filter(Boolean) as Point[]
  const center = leftoverPositions.length ? polygonCenter(leftoverPositions) : originalCenter

  const groups = state
    .eligibleGroups(mobEvents)
    .filter((group) => groupSize(group) > 1)
    .filter(({ mobCounts }) =>
      Object.keys(mobCounts).some((id) => state.anchorMobIds.has(Number(id))),
    )
    // A single-map pull has reliable positions, so don't claim a far anchored group by composition.
    .filter(
      (group) =>
        !singleMap ||
        center === null ||
        distance(group.averagePos, center) < ANCHORED_GROUP_MAX_DISTANCE,
    )
    .sort((a, b) => {
      // Nearest first: a far "perfect" match is only taken when there's no nearer fit (i.e. the
      // events were genuinely mis-mapped). Size breaks ties.
      if (center !== null) {
        const distDiff = distance(a.averagePos, center) - distance(b.averagePos, center)
        if (distDiff !== 0) return distDiff
      }
      return groupSize(b) - groupSize(a)
    })

  const { claimedGroups, consumedEvents } = claimFittingGroups(
    tally(mobEvents, ({ mobId }) => mobId),
    mobEvents,
    groups,
  )
  if (claimedGroups.length === 0) return null

  return state.claimGroups(
    claimedGroups.map((group) => group.id),
    mobEvents.filter((event) => !consumedEvents.has(event)),
  )
}

// Whether an exact-cover combination actually sits on the events it would claim. getPulledGroups
// takes the first composition-valid cover (largest groups first), so e.g. a far 2-shade group can
// claim both shades even when they sit right on two nearer single-shade groups. Rejecting such a
// cover sends it to the partial fallback, which claims the near groups instead. Only used where
// positions are reliable (singleMap).
function exactCoverSitsOnGroups(
  claimedGroupIds: string[],
  groups: Group[],
  mobEvents: MobEvent[],
): boolean {
  const poolCounts = tally(mobEvents, ({ mobId }) => mobId)
  const groupsById = new Map(groups.map((group) => [group.id, group]))
  const consumed = new Set<MobEvent>()
  for (const id of claimedGroupIds) {
    const group = groupsById.get(id)
    if (!group) continue
    const matched = matchGroupToEvents(group, mobEvents, (event) => consumed.has(event), {
      vetoNearerGroups: groups,
      vetoPoolCounts: poolCounts,
    })
    if (matched === null) return false
    matched.forEach((event) => consumed.add(event))
  }
  return true
}

// Cover the leftovers with whole groups by composition; position is only a filter/tiebreaker.
// Take an exact cover when one exists, else partially claim whichever whole groups confidently fit
// (e.g. when a singleton boss with no matching group is mixed into a swarm that composes cleanly).
function calculateCompositionPull(
  state: MatchState,
  mobEvents: MobEvent[],
  { originalCenter, singleMap }: Pick<PullStatus, 'originalCenter' | 'singleMap'>,
): CalculatedPull | null {
  if (mobEvents.length === 0) return null

  // Borrow a location: prefer leftover positions, fall back to the pull's original centroid.
  const leftoverPositions = mobEvents.map(({ pos }) => pos).filter(Boolean) as Point[]
  const center = leftoverPositions.length ? polygonCenter(leftoverPositions) : originalCenter

  const groups = state
    .eligibleGroups(mobEvents)
    // A single-map pull has reliable positions, so don't reach across the map to complete a cover.
    .filter(
      (group) =>
        !singleMap ||
        center === null ||
        distance(group.averagePos, center) < COMPOSITION_MAX_DISTANCE,
    )
    .sort((a, b) => {
      // Largest first (prefer whole linked groups); tie-break by proximity to the nearest event
      // the group can actually cover — the pooled centroid of a multi-location pull sits between
      // clusters and can't tell two identical groups apart.
      const sizeDiff = groupSize(b) - groupSize(a)
      if (sizeDiff !== 0) return sizeDiff
      return (
        nearestCoveredEventDistance(a, mobEvents, center) -
        nearestCoveredEventDistance(b, mobEvents, center)
      )
    })

  const mobCounts = tally(mobEvents, ({ mobId }) => mobId)

  const pulledGroups = getPulledGroups(mobCounts, groups)
  // With reliable positions, reject a clean cover whose groups don't actually sit on their events.
  // Seam pulls keep the composition-only cover — positions there can be mislabeled, and the exact
  // cover is what rescues a group split across the seam.
  if (
    pulledGroups !== null &&
    (!singleMap || exactCoverSitsOnGroups(pulledGroups, groups, mobEvents))
  ) {
    return state.claimGroups(pulledGroups, [])
  }

  // Partial fallback. This runs over an unsegmented pull, so composition alone could stitch
  // together a scattered coincidence — only claim a group whose matched events sit near it and
  // aren't owned by a markedly nearer group.
  const { claimedGroups, consumedEvents } = claimFittingGroups(mobCounts, mobEvents, groups, {
    maxEventDistance: CONFIDENT_CLAIM_MAX_DISTANCE,
    vetoNearerGroups: groups,
  })
  if (claimedGroups.length === 0) return null

  return state.claimGroups(
    claimedGroups.map((group) => group.id),
    mobEvents.filter((event) => !consumedEvents.has(event)),
  )
}

// When the pooled leftovers have no clean whole-group cover (e.g. one MDT-misgrouped mob, or a mob
// pulled several seconds later), run the whole-group match per time-based sub-pull.
function calculateCompositionPullFromSubPulls({ state, pullStatus }: PassArgs): CalculatedPull {
  return runPerSubPull(pullStatus.mobEventsRemaining, Infinity, (subPull) =>
    calculateCompositionPull(state, subPull, pullStatus),
  )
}

// Reconstruct a group that a real run split across two adjacent pulls — no single pull covers it,
// and byNearestSpawn would scatter it. Pool each adjacent pair's leftovers, claim whole groups
// sitting right on the pool, and split each group's spawns back across the two pulls by proximity.
function assignSplitGroups({ state, pullStatuses, trace }: CrossPullArgs): void {
  for (let idx = 0; idx < pullStatuses.length - 1; idx++) {
    const pullA = pullStatuses[idx]!
    const pullB = pullStatuses[idx + 1]!

    // A genuine split needs leftovers in both pulls; else the single-pull passes already had a shot.
    if (pullA.mobEventsRemaining.length === 0 || pullB.mobEventsRemaining.length === 0) continue

    const aEvents = new Set(pullA.mobEventsRemaining)
    const pooled = [...pullA.mobEventsRemaining, ...pullB.mobEventsRemaining]
    // Kept in lockstep with `consumed` for the fits-checks.
    const remaining = tally(pooled, ({ mobId }) => mobId)

    const pooledPositions = pooled.map(({ pos }) => pos).filter(Boolean) as Point[]
    const center = pooledPositions.length ? polygonCenter(pooledPositions) : null

    const groups = state
      .eligibleGroups(pooled)
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
      if (!groupFitsPool(group, remaining)) continue

      // A far event isn't part of this split: only match events sitting right on the group.
      const groupConsumed = matchGroupToEvents(group, pooled, (event) => consumed.has(event), {
        maxEventDistance: SPLIT_GROUP_MAX_DISTANCE,
        requireNearEvents: true,
      })
      if (groupConsumed === null) continue

      // Match each consumed event to the nearest unused spawn of its mob in the group.
      const groupSpawns = state.groupMobSpawns[group.id]!
      const usedSpawnIds = new Set<SpawnId>()
      const eventToSpawnId = new Map<MobEvent, SpawnId>()

      for (const event of groupConsumed) {
        const spawnsOfMob = groupSpawns.filter(
          (ms) => ms.mob.id === event.mobId && !usedSpawnIds.has(ms.spawn.id),
        )
        const spawn = spawnsOfMob.reduce((best, ms) =>
          distance(ms.spawn.pos, event.pos!) < distance(best.spawn.pos, event.pos!) ? ms : best,
        )
        usedSpawnIds.add(spawn.spawn.id)
        eventToSpawnId.set(event, spawn.spawn.id)
      }

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

      usedSpawnIds.forEach((id) => state.spawnIdsTaken.add(id))
      claimedGroupIds.push(group.id)
    }

    if (claimedGroupIds.length > 0) {
      pullA.mobEventsRemaining = pullA.mobEventsRemaining.filter((e) => !consumed.has(e))
      pullB.mobEventsRemaining = pullB.mobEventsRemaining.filter((e) => !consumed.has(e))
      if (pullA.mobEventsRemaining.length === 0) pullA.complete = true
      if (pullB.mobEventsRemaining.length === 0) pullB.complete = true
      const claimed = new Set(claimedGroupIds)
      state.groupsRemaining = state.groupsRemaining.filter((group) => !claimed.has(group.id))
    }
  }
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

// Find a combination of groups whose summed composition exactly covers remainingMobs (backtracking
// search over `groups` in order, so the given order decides which valid cover wins).
function getPulledGroups(remainingMobs: Record<number, number>, groups: Group[]): string[] | null {
  // Numeric entries precomputed once; the recursive search is hot.
  const groupEntries: [number, number][][] = groups.map((g) =>
    Object.entries(g.mobCounts).map(([k, v]) => [Number(k), v]),
  )

  // suffixCap[i][mobId] = total supply of mobId across groups[i..n-1], for pruning dead branches.
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
  if (remainingTotal === 0) return []

  if (groupIdx >= groups.length) return null

  // Prune: if the remaining groups can't supply some still-needed mob, the branch is dead.
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

function findExactSpawns({ state, pullStatus, idx }: PassArgs): CalculatedPull | null {
  const { dungeon, spawnIdsTaken, errors } = state
  const { mobEventsRemaining: mobEvents, originalCenter } = pullStatus
  const mobSpawns: MobSpawn[] = []

  // When an event's own position was dropped, borrow one from its positioned same-mob pull-mates
  // (falling back to the pull center), so a tight cluster straddling the far-from-spawn cutoff
  // lands together instead of scattering to arbitrary first-available spawns.
  const borrowedCenter = (mobId: number): Point[] => {
    const positions = mobEvents
      .filter((event) => event.mobId === mobId)
      .flatMap(({ pos, altPos }) => [pos, altPos].filter(Boolean) as Point[])
    const center = positions.length ? polygonCenter(positions) : originalCenter
    return center ? [center] : []
  }

  for (const { mobId, pos, altPos } of mobEvents) {
    const matchingMobs = dungeon.mobSpawnsList.filter(({ mob }) => mob.id === mobId)
    const available = matchingMobs.filter(({ spawn }) => !spawnIdsTaken.has(spawn.id))

    if (available.length === 0) {
      // If it doesn't matter for count just ignore it
      if (matchingMobs.length !== 0 && matchingMobs[0]!.mob.count === 0) continue

      errors.push(`Failed at finding individual matching mob id ${mobId} in pull idx ${idx}`)
      continue
    }

    // Nearest spawn to either candidate position, or to the borrowed location when pos was dropped.
    const ownPositions = [pos, altPos].filter(Boolean) as Point[]
    const positions = ownPositions.length ? ownPositions : borrowedCenter(mobId)
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

  state.groupsRemaining = state.groupsRemaining.map((group) => ({
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
  return { spawnIds, mobEventsRemaining: [] }
}
