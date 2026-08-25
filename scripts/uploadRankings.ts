import crypto from 'crypto'
import { del, list, put } from '@vercel/blob'
import { type DungeonKey, dungeonKeys } from '../src/data/dungeonKeys.ts'
import type { SampleRoute } from '../src/util/types.ts'
import {
  blobPrefix,
  dungeonBlobPath,
  manifestPath,
  type RankingsManifest,
  readDungeonRoutes,
  versionFromBlobPath,
  versionFromBlobUrl,
} from './rankingsFiles.ts'
import { fetchCurrentManifest, fetchDungeonRoutes } from './rankingsBlob.ts'

const args = process.argv.slice(2)
const force = args.includes('--force')

/**
 * Dungeon keys to publish, e.g. `yarn rankings:upload kr`. Everything else is carried over from the
 * published manifest untouched, so a local folder that is stale for those dungeons can't roll
 * production back. Defaults to every dungeon.
 */
const selectedKeys = args.filter((arg) => !arg.startsWith('--'))

const unknownKeys = selectedKeys.filter((key) => !dungeonKeys.includes(key as DungeonKey))
if (unknownKeys.length) {
  throw new Error(
    `Unknown dungeon key(s): ${unknownKeys.join(', ')}\nValid keys: ${dungeonKeys.join(', ')}`,
  )
}

const partial = selectedKeys.length > 0
const selected: DungeonKey[] = partial ? (selectedKeys as DungeonKey[]) : [...dungeonKeys]

/**
 * queryRankings.ts deletes stale files before re-adding, so a partial WCL failure leaves a hole
 * rather than an error. Refuse to publish a set that shrank more than this.
 */
const minRetainRatio = 0.75

const immutableMaxAge = 31536000

/** Vercel Blob rejects anything under 60s, so this is the floor on manifest staleness. */
const manifestMaxAge = 60

const payloads = new Map<DungeonKey, string>()
const counts = new Map<DungeonKey, number>()
for (const dungeonKey of selected) {
  const routes = readDungeonRoutes(dungeonKey)
  if (!routes.length) {
    if (partial) {
      throw new Error(`No local routes for ${dungeonKey}. Run \`yarn r ${dungeonKey}\` first.`)
    }

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

if (partial && !previousManifest) {
  throw new Error('No published manifest to carry the other dungeons over from.')
}

if (previousManifest && !force) {
  const shrunk: string[] = []

  await Promise.all(
    Object.entries(previousManifest.dungeons)
      // The others aren't being republished, so their published counts are what stays live.
      .filter(([key]) => payloads.has(key as DungeonKey))
      .map(async ([key, url]) => {
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

/** Dungeons this run isn't republishing, left pointing at the blobs they already resolve to. */
const carried: RankingsManifest['dungeons'] = {}
if (partial && previousManifest) {
  for (const dungeonKey of dungeonKeys) {
    const url = previousManifest.dungeons[dungeonKey]
    if (!payloads.has(dungeonKey) && url) {
      carried[dungeonKey] = url
    }
  }
}

// Covers the whole published set, not just what's being uploaded, so the version still identifies
// what clients will see. A carried URL stands in for its payload: it already embeds that content's
// version, so it changes exactly when that dungeon's content does.
const hash = crypto.createHash('sha256')
for (const dungeonKey of dungeonKeys) {
  const content = payloads.get(dungeonKey) ?? carried[dungeonKey]
  if (content === undefined) {
    continue
  }

  hash.update(`${dungeonKey}:`)
  hash.update(content)
}
const version = hash.digest('hex').slice(0, 8)

if (previousManifest?.version === version) {
  console.log(`Rankings unchanged (version ${version}), nothing to publish`)
  process.exit(0)
}

const dungeons: RankingsManifest['dungeons'] = { ...carried }
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
if (Object.keys(carried).length) {
  console.log(`Carried over unchanged: ${Object.keys(carried).join(', ')}`)
}

// Keep every version either manifest still points at, not just the two version ids: a partial
// upload leaves untouched dungeons on older versions, and deleting those breaks the live manifest.
// The previous manifest is kept whole for clients that already resolved it.
const keepVersions = new Set([version])
for (const manifestToKeep of [manifest, previousManifest]) {
  for (const url of Object.values(manifestToKeep?.dungeons ?? {})) {
    const blobVersion = versionFromBlobUrl(url)
    if (blobVersion) {
      keepVersions.add(blobVersion)
    }
  }
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
