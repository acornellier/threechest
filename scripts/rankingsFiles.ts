import fs from 'fs'
import * as path from 'path'
import { getDirname } from '../server/files.ts'
import type { DungeonKey } from '../src/data/dungeonKeys.ts'
import type { SampleRoute } from '../src/util/types.ts'

const dirname = getDirname(import.meta.url)

export const sampleRoutesFolder = path.join(dirname, '../src/data/sampleRoutes')

export const dungeonFolder = (dungeonKey: DungeonKey) => path.join(sampleRoutesFolder, dungeonKey)

/** File names of the locally cached ranked routes for one dungeon, sorted. */
export function dungeonRouteFiles(dungeonKey: DungeonKey): string[] {
  const folder = dungeonFolder(dungeonKey)
  if (!fs.existsSync(folder)) {
    return []
  }

  // Sorted so the version hash is stable regardless of filesystem ordering.
  return fs
    .readdirSync(folder)
    .filter((file) => file.endsWith('.json'))
    .sort()
}

/**
 * The locally cached ranked routes for one dungeon. Shared by uploadRankings.ts and the dev
 * server's local rankings plugin, so previewing locally matches what publishing would produce.
 */
export function readDungeonRoutes(dungeonKey: DungeonKey): SampleRoute[] {
  const folder = dungeonFolder(dungeonKey)

  return dungeonRouteFiles(dungeonKey).map(
    (file) => JSON.parse(fs.readFileSync(path.join(folder, file)).toString()) as SampleRoute,
  )
}

/**
 * The on-disk name for a ranked route. queryRankings.ts skips any route whose file already
 * exists, so downloadRankings.ts must reproduce this exactly or every run re-fetches all of WCL.
 */
export const toFileName = (report: { code: string; fightID: number }) =>
  `${report.code}-${report.fightID}.json`

export const sampleRouteFileName = (sampleRoute: SampleRoute) => {
  if (!sampleRoute.wclRanking) {
    throw new Error(`Sample route "${sampleRoute.route.name}" has no wclRanking`)
  }

  return toFileName(sampleRoute.wclRanking.report)
}

export const blobPrefix = 'rankings'
export const manifestPath = `${blobPrefix}/manifest.json`

export const dungeonBlobPath = (version: string, dungeonKey: DungeonKey) =>
  `${blobPrefix}/${version}/${dungeonKey}.json`

/** Pulls "a1b2c3d4" out of "rankings/a1b2c3d4/aa.json". Null for the manifest itself. */
export const versionFromBlobPath = (pathname: string): string | null => {
  const match = new RegExp(`^${blobPrefix}/([^/]+)/[^/]+\\.json$`).exec(pathname)
  return match?.[1] ?? null
}

export interface RankingsManifest {
  version: string
  /** Full blob URLs, so the client never has to encode the layout above. */
  dungeons: Partial<Record<DungeonKey, string>>
}
