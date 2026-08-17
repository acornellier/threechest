/**
 * One-time migration of shared routes in Firestore from the pre-6.2 AceSerializer format to MDT's
 * `!~MDT2~` format, so the app no longer needs a legacy decoder to open old share links.
 *
 * Decoding uses node-weakauras-parser, which only runs in node. That is the whole point of doing
 * this as a script: once the collection is migrated, nothing in the browser has to read the old
 * format and the dependency can go.
 *
 * Dry run by default. Pass --write to commit.
 *
 * This script and its node-weakauras-parser devDependency are the last remaining readers of the
 * old format. Delete both once the migration has been run.
 */

import { collection, doc, getDocs, writeBatch } from 'firebase/firestore'
import parser from 'node-weakauras-parser'

import { dungeonsByMdtIdx } from '../src/data/dungeons.ts'
import { firestore, type FirestoreRoute } from '../src/store/firestore.ts'
import { decodeMdtString, encodeMdtString } from '../src/util/mdt/mdt2.ts'
import type { MdtRoute } from '../src/util/types.ts'

const write = process.argv.includes('--write')
const batchSize = 400

type Migration = { id: string; mdtString: string }

const migrations: Migration[] = []
const failures: { id: string; error: string }[] = []
const skippedDungeons: Record<number, number> = {}
let alreadyMigrated = 0
let expired = 0
let staleDungeon = 0
let beforeBytes = 0
let afterBytes = 0

const now = new Date()

const snapshot = await getDocs(collection(firestore, 'routes'))
console.log(`Found ${snapshot.size} shared routes`)

for (const document of snapshot.docs) {
  const { mdtString, expiry } = document.data() as FirestoreRoute

  if (!mdtString) {
    failures.push({ id: document.id, error: 'missing mdtString' })
    continue
  }

  if (mdtString.startsWith('!~MDT2~')) {
    alreadyMigrated++
    continue
  }

  // The share link is already dead, so nothing is lost by leaving it in the old format.
  if (expiry && (expiry as unknown as { toDate: () => Date }).toDate() < now) {
    expired++
    continue
  }

  try {
    const mdtRoute = (await parser.decode(mdtString)) as MdtRoute

    // Routes for dungeons outside the current pool already fail to open in the app, migrated or
    // not, so they are not worth rewriting.
    const dungeonIdx = mdtRoute.value.currentDungeonIdx
    if (!dungeonsByMdtIdx[dungeonIdx]) {
      staleDungeon++
      skippedDungeons[dungeonIdx] = (skippedDungeons[dungeonIdx] ?? 0) + 1
      continue
    }

    const migrated = await encodeMdtString(mdtRoute)

    // Re-read our own output so a route is never written back in a form we cannot open.
    const roundTripped = await decodeMdtString(migrated)
    if (JSON.stringify(roundTripped) !== JSON.stringify(mdtRoute)) {
      throw new Error('round trip changed the route')
    }

    beforeBytes += mdtString.length
    afterBytes += migrated.length
    migrations.push({ id: document.id, mdtString: migrated })
  } catch (err) {
    failures.push({ id: document.id, error: (err as Error).message })
  }
}

console.log(`\nMigratable: ${migrations.length}`)
console.log(`Already MDT2: ${alreadyMigrated}`)
console.log(`Skipped, expired: ${expired}`)
console.log(`Skipped, dungeon no longer in pool: ${staleDungeon}`)
console.log(`Failed: ${failures.length}`)

const bySize = Object.entries(skippedDungeons).sort(([, a], [, b]) => b - a)
if (bySize.length) {
  console.log(`\nSkipped dungeon indexes: ${bySize.map(([idx, n]) => `${idx} (${n})`).join(', ')}`)
}

if (migrations.length) {
  const change = ((afterBytes / beforeBytes - 1) * 100).toFixed(1)
  console.log(`Size: ${beforeBytes} -> ${afterBytes} bytes (${change}%)`)
}

for (const { id, error } of failures.slice(0, 20)) {
  console.log(`  ${id}: ${error}`)
}
if (failures.length > 20) {
  console.log(`  ...and ${failures.length - 20} more`)
}

if (!write) {
  console.log('\nDry run. Pass --write to commit.')
  process.exit(0)
}

for (let i = 0; i < migrations.length; i += batchSize) {
  const chunk = migrations.slice(i, i + batchSize)
  const batch = writeBatch(firestore)

  for (const { id, mdtString } of chunk) {
    batch.update(doc(firestore, 'routes', id), { mdtString })
  }

  await batch.commit()
  console.log(`Committed ${Math.min(i + batchSize, migrations.length)}/${migrations.length}`)
}

console.log('Done.')
process.exit(0)
