// Checks src/data/coordinates/mdtMapOffsets.ts against reality, without eyeballing the map.
//
// Every cached WCL fight is a set of mob positions in WoW world coordinates, and every dungeon's
// mdt json is the same mobs' positions in MDT map coordinates. If a map's offsets are right, an
// event for mob X lands on top of one of mob X's spawns; if they are wrong or missing, it lands
// far away. So: run each event through wclPointToLeafletPoint and measure the distance to the
// nearest spawn of that same mob. That distance is exactly what MAX_PLAUSIBLE_SPAWN_DISTANCE
// gates on in wclCalc, so a bad map here means wclCalc is discarding real positions.
//
//   tsx scripts/checkMapOffsets.ts            # every cached fight
//   tsx scripts/checkMapOffsets.ts murd fang  # only these dungeon keys
//
// Reads server/cache/wclRoute — populate it with `yarn r` (or `yarn r <key>`) first. Verdicts
// are calibrated against the hand-aligned Season 1 maps (see THRESHOLDS below).

import fs from 'fs'
import * as path from 'path'
import { dungeons } from '../src/data/dungeons.ts'
import { mapBounds } from '../src/data/coordinates/mapBounds.ts'
import { mdtMapOffsets } from '../src/data/coordinates/mdtMapOffsets.ts'
import {
  MAX_PLAUSIBLE_SPAWN_DISTANCE,
  nearestSpawnDistance,
  resolveMapOffsetId,
  spawnPositionsByMob,
  wclPointToLeafletPoint,
  type WclPoint,
  type WclResult,
} from '../src/util/wclCalc.ts'
import type { Dungeon } from '../src/data/types.ts'
import { getDirname } from '../server/files.ts'

const dirname = getDirname(import.meta.url)
const cacheDir = path.join(dirname, '..', 'server', 'cache', 'wclRoute')

// Median nearest-spawn distance, in map units. Calibrated on the 17 hand-aligned Season 1 maps
// (magi/cavns/wind/pit), whose medians ran 2.5–12.5 with a pooled median of 4.5. Identity offsets
// on an unaligned map measure 57–92 by comparison, so the bands are wide and unambiguous.
const THRESHOLDS = { ok: 15, suspect: 30 }

// Below this many measured events a map's numbers are noise — one clustered pull can carry them.
const MIN_CONFIDENT_SAMPLE = 20

// Share of events past MAX_PLAUSIBLE_SPAWN_DISTANCE that is normal even when aligned: patrols and
// seam mislabels. The hand-aligned maps pooled to 1.1%, with one map (magi 2519) at 13.5%.
const MAX_NORMAL_DISCARD_RATE = 0.15

type MapStats = {
  dungeonKey: string
  offsetMapId: number
  hasEntry: boolean
  distances: number[]
}

type Verdict = 'ok' | 'suspect' | 'BAD' | 'low data'

const requestedKeys = process.argv.slice(2)
const selectedDungeons = requestedKeys.length
  ? dungeons.filter((dungeon) => requestedKeys.includes(dungeon.key))
  : dungeons

const unknownKeys = requestedKeys.filter((key) => !dungeons.some((dungeon) => dungeon.key === key))
if (unknownKeys.length) {
  console.error(`Unknown dungeon key(s): ${unknownKeys.join(', ')}`)
  process.exit(1)
}

// Dungeons without a wclEncounterId are not on Warcraft Logs, so they have nothing to check.
const dungeonsByEncounterId = new Map<number, Dungeon>(
  selectedDungeons
    .filter((dungeon) => dungeon.wclEncounterId !== undefined)
    .map((dungeon) => [dungeon.wclEncounterId!, dungeon]),
)

const statsByOffsetMapId = new Map<number, MapStats>()
const missingBoundsMapIds = new Set<number>()
const skippedFights: string[] = []
let fightsRead = 0
let eventsWithoutMob = 0

const files = fs.readdirSync(cacheDir).filter((file) => file.endsWith('.json'))

for (const file of files) {
  const wclResult = JSON.parse(fs.readFileSync(path.join(cacheDir, file), 'utf-8')) as WclResult
  const dungeon = dungeonsByEncounterId.get(wclResult.encounterID)
  if (!dungeon) {
    // Either a dungeon the run did not ask for, or a fight from a season no longer shipped.
    if (!requestedKeys.length) {
      skippedFights.push(`${file} (encounterID ${wclResult.encounterID} not in dungeons.ts)`)
    }
    continue
  }

  fightsRead++
  const spawnPositions = spawnPositionsByMob(dungeon)

  for (const event of wclResult.events) {
    if (!event.x || !event.y || !event.mapID) {
      continue
    }
    if (!mapBounds[event.mapID]) {
      // A step 5a gap, not a step 5b one: wclCalc drops these before offsets ever apply.
      missingBoundsMapIds.add(event.mapID)
      continue
    }

    const mobSpawnPositions = spawnPositions.get(event.gameId)
    if (!mobSpawnPositions?.length) {
      // Mob is in the log but not in the mdt data (seasonal affix mobs, untracked adds).
      eventsWithoutMob++
      continue
    }

    const wclPoint = event as WclPoint
    const offsetMapId = resolveMapOffsetId(wclPoint, wclResult.deathEvents)
    const position = wclPointToLeafletPoint(wclPoint, wclResult.deathEvents)

    let stats = statsByOffsetMapId.get(offsetMapId)
    if (!stats) {
      stats = {
        dungeonKey: dungeon.key,
        offsetMapId,
        hasEntry: offsetMapId in mdtMapOffsets,
        distances: [],
      }
      statsByOffsetMapId.set(offsetMapId, stats)
    }
    stats.distances.push(nearestSpawnDistance(position, mobSpawnPositions))
  }
}

const percentile = (sortedValues: number[], fraction: number): number =>
  sortedValues[Math.min(sortedValues.length - 1, Math.floor(fraction * sortedValues.length))] ?? NaN

function verdictFor(median: number, discardRate: number, sampleCount: number): Verdict {
  if (sampleCount < MIN_CONFIDENT_SAMPLE) {
    return 'low data'
  }
  if (median > THRESHOLDS.suspect) {
    return 'BAD'
  }
  if (median > THRESHOLDS.ok || discardRate > MAX_NORMAL_DISCARD_RATE) {
    return 'suspect'
  }
  return 'ok'
}

const rows = [...statsByOffsetMapId.values()]
  .map((stats) => {
    const sorted = [...stats.distances].sort((a, b) => a - b)
    const median = percentile(sorted, 0.5)
    const discardRate =
      sorted.filter((distance) => distance > MAX_PLAUSIBLE_SPAWN_DISTANCE).length / sorted.length
    return {
      ...stats,
      sampleCount: sorted.length,
      median,
      p90: percentile(sorted, 0.9),
      discardRate,
      verdict: verdictFor(median, discardRate, sorted.length),
    }
  })
  .sort((a, b) =>
    a.dungeonKey === b.dungeonKey
      ? a.offsetMapId - b.offsetMapId
      : a.dungeonKey.localeCompare(b.dungeonKey),
  )

if (!fightsRead) {
  console.error(
    `No cached fights matched. Run \`yarn r${requestedKeys.length ? ' ' + requestedKeys.join(' ') : ''}\` to populate ${path.relative(process.cwd(), cacheDir)}.`,
  )
  process.exit(1)
}

const pad = (value: string | number, width: number) => String(value).padStart(width)

console.log()
console.log(
  `${'dungeon'.padEnd(8)} ${'uiMapId'.padEnd(9)} ${'entry'.padEnd(6)} ${pad('events', 7)} ${pad('median', 7)} ${pad('p90', 7)} ${pad('discard', 8)}  verdict`,
)
for (const row of rows) {
  console.log(
    `${row.dungeonKey.padEnd(8)} ${String(row.offsetMapId).padEnd(9)} ${(row.hasEntry ? 'yes' : 'NO').padEnd(6)} ` +
      `${pad(row.sampleCount, 7)} ${pad(row.median.toFixed(1), 7)} ${pad(row.p90.toFixed(1), 7)} ` +
      `${pad(`${(100 * row.discardRate).toFixed(1)}%`, 8)}  ${row.verdict}`,
  )
}

const needsWork = rows.filter((row) => row.verdict === 'BAD' || row.verdict === 'suspect')
const lowData = rows.filter((row) => row.verdict === 'low data')

console.log()
console.log(
  `${fightsRead} cached fight(s), ${rows.length} map(s). ` +
    `median = typical distance from an event to the nearest spawn of its own mob; ` +
    `discard = share past MAX_PLAUSIBLE_SPAWN_DISTANCE (${MAX_PLAUSIBLE_SPAWN_DISTANCE}), which wclCalc throws away.`,
)
console.log(
  `Hand-aligned maps measure a median of ~2.5-12.5. ok <= ${THRESHOLDS.ok}, suspect <= ${THRESHOLDS.suspect}, BAD above.`,
)

if (missingBoundsMapIds.size) {
  console.log()
  console.log(
    `Missing from mapBounds (step 5a, before offsets can apply): ${[...missingBoundsMapIds].sort((a, b) => a - b).join(', ')}`,
  )
}

if (lowData.length) {
  console.log()
  console.log(
    `Too few events to judge (< ${MIN_CONFIDENT_SAMPLE}), align by hand: ` +
      lowData
        .map((row) => `${row.dungeonKey}/${row.offsetMapId} (n=${row.sampleCount})`)
        .join(', '),
  )
}

if (skippedFights.length) {
  console.log()
  console.log(`Skipped ${skippedFights.length} fight(s):`)
  for (const skipped of skippedFights) {
    console.log(`  ${skipped}`)
  }
}

if (eventsWithoutMob) {
  console.log()
  console.log(`${eventsWithoutMob} event(s) ignored: mob not present in the dungeon's mdt data.`)
}

if (needsWork.length) {
  console.log()
  console.log(
    `${needsWork.length} map(s) need attention: ` +
      needsWork.map((row) => `${row.dungeonKey}/${row.offsetMapId}`).join(', '),
  )
  process.exit(1)
}
