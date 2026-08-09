import fs from 'fs'
import * as path from 'path'
import crypto from 'crypto'
import { del, list, put } from '@vercel/blob'
import { type DungeonKey, dungeonKeys } from '../src/data/dungeonKeys.ts'
import type { SampleRoute } from '../src/util/types.ts'
import {
  blobPrefix,
  dungeonBlobPath,
  dungeonFolder,
  manifestPath,
  type RankingsManifest,
  versionFromBlobPath,
} from './rankingsFiles.ts'
import { fetchCurrentManifest, fetchDungeonRoutes } from './rankingsBlob.ts'

const force = process.argv.includes('--force')

/**
 * queryRankings.ts deletes stale files before re-adding, so a partial WCL failure leaves a hole
 * rather than an error. Refuse to publish a set that shrank more than this.
 */
const minRetainRatio = 0.75

const immutableMaxAge = 31536000

/** Vercel Blob rejects anything under 60s, so this is the floor on manifest staleness. */
const manifestMaxAge = 60

function readDungeonRoutes(dungeonKey: DungeonKey): SampleRoute[] {
  const folder = dungeonFolder(dungeonKey)
  if (!fs.existsSync(folder)) {
    return []
  }

  // Sorted so the version hash is stable regardless of filesystem ordering.
  return fs
    .readdirSync(folder)
    .filter((file) => file.endsWith('.json'))
    .sort()
    .map((file) => JSON.parse(fs.readFileSync(path.join(folder, file)).toString()) as SampleRoute)
}

const payloads = new Map<DungeonKey, string>()
const counts = new Map<DungeonKey, number>()
for (const dungeonKey of dungeonKeys) {
  const routes = readDungeonRoutes(dungeonKey)
  if (!routes.length) {
    console.warn(`No local routes for ${dungeonKey}, skipping`)
    continue
  }

  payloads.set(dungeonKey, JSON.stringify(routes))
  counts.set(dungeonKey, routes.length)
}

if (!payloads.size) {
  throw new Error('No local rankings found. Run `yarn rankings:download` or `yarn r` first.')
}

const previousManifest = await fetchCurrentManifest()

if (previousManifest && !force) {
  const shrunk: string[] = []

  await Promise.all(
    Object.entries(previousManifest.dungeons).map(async ([key, url]) => {
      const dungeonKey = key as DungeonKey
      const publishedRoutes = await fetchDungeonRoutes<SampleRoute[]>(url)
      const published = publishedRoutes.length
      const current = counts.get(dungeonKey) ?? 0

      if (published && current < published * minRetainRatio) {
        shrunk.push(`${dungeonKey}: ${published} published -> ${current} local`)
      }
    }),
  )

  if (shrunk.length) {
    throw new Error(
      `Refusing to publish, route counts dropped sharply (likely a partial WCL failure):\n` +
        `${shrunk.join('\n')}\n` +
        `Re-run the sync, or pass --force if this is intentional.`,
    )
  }
}

const hash = crypto.createHash('sha256')
for (const dungeonKey of dungeonKeys) {
  const payload = payloads.get(dungeonKey)
  if (payload === undefined) {
    continue
  }

  hash.update(`${dungeonKey}:`)
  hash.update(payload)
}
const version = hash.digest('hex').slice(0, 8)

if (previousManifest?.version === version) {
  console.log(`Rankings unchanged (version ${version}), nothing to publish`)
  process.exit(0)
}

const dungeons: RankingsManifest['dungeons'] = {}
for (const [dungeonKey, payload] of payloads) {
  const { url } = await put(dungeonBlobPath(version, dungeonKey), payload, {
    access: 'public',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'application/json',
    cacheControlMaxAge: immutableMaxAge,
  })

  dungeons[dungeonKey] = url
  console.log(`Uploaded ${dungeonKey} (${counts.get(dungeonKey)} routes)`)
}

// Written last: until this flips, clients keep resolving the previous version.
const manifest: RankingsManifest = { version, dungeons }
const { url: manifestUrl } = await put(manifestPath, JSON.stringify(manifest), {
  access: 'public',
  addRandomSuffix: false,
  allowOverwrite: true,
  contentType: 'application/json',
  cacheControlMaxAge: manifestMaxAge,
})

console.log(`Published version ${version} -> ${manifestUrl}`)

// Keep the previous version around for clients that already resolved it.
const keepVersions = new Set([version])
if (previousManifest) {
  keepVersions.add(previousManifest.version)
}

const stale: string[] = []
let cursor: string | undefined
do {
  const result = await list({ prefix: `${blobPrefix}/`, cursor })
  for (const blob of result.blobs) {
    const blobVersion = versionFromBlobPath(blob.pathname)
    if (blobVersion && !keepVersions.has(blobVersion)) {
      stale.push(blob.url)
    }
  }

  cursor = result.hasMore ? result.cursor : undefined
} while (cursor)

if (stale.length) {
  await del(stale)
  console.log(`Pruned ${stale.length} stale blob(s)`)
}
