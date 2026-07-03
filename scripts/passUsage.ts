// Pass-usage histogram: runs wclResultToRoute with a trace over every cached WCL result in
// server/cache/wclRoute and reports how many events each pass assigned, per dungeon and overall.
// Used to spot dead or near-dead passes before refactoring wclCalc.ts.
//
//   tsx scripts/passUsage.ts

import fs from 'fs'
import * as path from 'path'
import { dungeons } from '../src/data/dungeons.ts'
import {
  passes,
  wclEventKey,
  wclResultToRoute,
  type WclResult,
  type WclTrace,
} from '../src/util/wclCalc.ts'
import { getDirname } from '../server/files.ts'

const dirname = getDirname(import.meta.url)
const cacheDir = path.join(dirname, '..', 'server', 'cache', 'wclRoute')

const passNames = passes.map(({ name }) => name)
const statusNames = ['duplicate', 'alt', 'no-death', 'untracked', 'unassigned']
const columns = [...passNames, ...statusNames]

type Tally = {
  fixtures: number
  fixturesWithErrors: number
  totalEvents: number
  // events per pass name / terminal status
  counts: Record<string, number>
  // fixtures where each pass assigned at least one event
  fixturesUsingPass: Record<string, number>
}

const newTally = (): Tally => ({
  fixtures: 0,
  fixturesWithErrors: 0,
  totalEvents: 0,
  counts: {},
  fixturesUsingPass: {},
})

const overall = newTally()
const byDungeon = new Map<string, Tally>()

const files = fs.readdirSync(cacheDir).filter((file) => file.endsWith('.json'))
const skipped: string[] = []

for (const file of files) {
  const wclResult = JSON.parse(fs.readFileSync(path.join(cacheDir, file), 'utf-8')) as WclResult
  const dungeon = dungeons.find((dungeon) => dungeon.wclEncounterId === wclResult.encounterID)
  if (!dungeon) {
    skipped.push(`${file} (encounterID ${wclResult.encounterID} unsupported)`)
    continue
  }

  const trace: WclTrace = new Map()
  let errors: string[]
  try {
    errors = wclResultToRoute(wclResult, undefined, trace).errors
  } catch (error) {
    skipped.push(`${file} (${(error as Error).message})`)
    continue
  }

  const dungeonTally = byDungeon.get(dungeon.key) ?? newTally()
  byDungeon.set(dungeon.key, dungeonTally)

  const fixturePassCounts: Record<string, number> = {}
  for (const event of wclResult.events) {
    const entry = trace.get(wclEventKey(event))
    const column =
      entry?.status === 'assigned' ? (entry.passName ?? 'unassigned') : (entry?.status ?? 'unassigned')
    fixturePassCounts[column] = (fixturePassCounts[column] ?? 0) + 1
  }

  for (const tally of [overall, dungeonTally]) {
    tally.fixtures++
    if (errors.length > 0) tally.fixturesWithErrors++
    tally.totalEvents += wclResult.events.length
    for (const [column, count] of Object.entries(fixturePassCounts)) {
      tally.counts[column] = (tally.counts[column] ?? 0) + count
      if (passNames.includes(column)) {
        tally.fixturesUsingPass[column] = (tally.fixturesUsingPass[column] ?? 0) + 1
      }
    }
  }
}

function printTally(label: string, tally: Tally) {
  console.log(`\n${label} — ${tally.fixtures} fixtures, ${tally.totalEvents} events` +
    (tally.fixturesWithErrors ? `, ${tally.fixturesWithErrors} fixtures with errors` : ''))

  const assignedTotal = passNames.reduce((sum, name) => sum + (tally.counts[name] ?? 0), 0)
  const rows = columns.map((column) => {
    const count = tally.counts[column] ?? 0
    const isPass = passNames.includes(column)
    const share = isPass && assignedTotal ? `${((100 * count) / assignedTotal).toFixed(1)}%` : ''
    const used = isPass ? `${tally.fixturesUsingPass[column] ?? 0}/${tally.fixtures}` : ''
    return { column, count, share, used }
  })

  console.log(`  ${'pass/status'.padEnd(24)}${'events'.padStart(8)}${'% asgn'.padStart(9)}${'fixtures'.padStart(12)}`)
  for (const { column, count, share, used } of rows) {
    console.log(`  ${column.padEnd(24)}${String(count).padStart(8)}${share.padStart(9)}${used.padStart(12)}`)
  }
}

printTally('OVERALL', overall)

for (const [dungeonKey, tally] of [...byDungeon.entries()].sort()) {
  printTally(dungeonKey, tally)
}

if (skipped.length > 0) {
  console.log(`\nSkipped ${skipped.length}:`)
  for (const line of skipped) console.log(`  ${line}`)
}
