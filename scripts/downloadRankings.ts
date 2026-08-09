import fs from 'fs'
import * as path from 'path'
import type { DungeonKey } from '../src/data/dungeonKeys.ts'
import type { SampleRoute } from '../src/util/types.ts'
import { dungeonFolder, sampleRouteFileName } from './rankingsFiles.ts'
import { fetchCurrentManifest, fetchDungeonRoutes } from './rankingsBlob.ts'

/**
 * Rehydrates src/data/sampleRoutes/<dungeon>/ from the published blobs. queryRankings.ts skips
 * any route whose file already exists, so this is what keeps a sync run from re-fetching every
 * fight from WCL.
 */
const manifest = await fetchCurrentManifest()

if (!manifest) {
  console.log('No published manifest yet, nothing to download')
  process.exit(0)
}

console.log(`Downloading rankings version ${manifest.version}`)

for (const [key, url] of Object.entries(manifest.dungeons)) {
  const dungeonKey = key as DungeonKey
  const routes = await fetchDungeonRoutes<SampleRoute[]>(url)

  // Mirror the blob exactly, so a route dropped upstream doesn't linger and get re-published.
  const folder = dungeonFolder(dungeonKey)
  fs.rmSync(folder, { recursive: true, force: true })
  fs.mkdirSync(folder, { recursive: true })

  for (const sampleRoute of routes) {
    fs.writeFileSync(
      path.join(folder, sampleRouteFileName(sampleRoute)),
      JSON.stringify(sampleRoute),
    )
  }

  console.log(`Downloaded ${dungeonKey} (${routes.length} routes)`)
}
