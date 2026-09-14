import DotenvFlow from 'dotenv-flow'
import { isProd } from '../src/util/isDev.ts'
import { type DungeonKey, dungeonKeys } from '../src/data/dungeonKeys.ts'
import type { SampleRoute } from '../src/util/types.ts'
import type { RankingsManifest } from '../scripts/rankingsFiles.ts'
import {
  buildEasySampleRoutes,
  type SampleRoutes,
} from '../src/data/sampleRoutes/sampleRoutesUncompiled.ts'

if (!isProd) {
  DotenvFlow.config()
}

const rankingsBaseUrl = process.env.VITE_RANKINGS_BASE_URL

export interface SampleRoutesResponse {
  /** Manifest version the ranked routes came from, or null when none are configured. */
  rankingsVersion: string | null
  /**
   * Easy routes first, then ranked. Ranked routes are the ones carrying `wclRanking`, so the two
   * kinds stay distinguishable without a second field.
   */
  dungeons: SampleRoutes
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`${url} responded ${res.status} ${res.statusText}`)
  }

  return (await res.json()) as T
}

/** Decoding the MDT strings is deterministic, so one pass per cold start is enough. */
let easyRoutesPromise: Promise<SampleRoutes> | undefined

interface RankedRoutes {
  version: string
  byDungeon: Partial<Record<DungeonKey, SampleRoute[]>>
}

/**
 * Resolves the manifest and then every dungeon it points at. A configured-but-failing store throws
 * rather than degrading to easy-only: silently serving 8 routes where ~100 were expected is worse
 * for a consumer than an error.
 */
async function fetchRankedRoutes(): Promise<RankedRoutes | null> {
  if (!rankingsBaseUrl) {
    return null
  }

  const manifest = await fetchJson<RankingsManifest>(`${rankingsBaseUrl}/rankings/manifest.json`)

  const entries = await Promise.all(
    dungeonKeys.map(async (dungeonKey) => {
      const url = manifest.dungeons[dungeonKey]
      if (!url) {
        return [dungeonKey, []] as const
      }

      // The blob manifest holds absolute URLs, but localRankingsPlugin emits relative ones for the
      // browser to resolve against the page origin. Node has no origin, so resolve them here.
      const routes = await fetchJson<SampleRoute[]>(new URL(url, rankingsBaseUrl).toString())
      return [dungeonKey, routes] as const
    }),
  )

  return { version: manifest.version, byDungeon: Object.fromEntries(entries) }
}

export async function getSampleRoutes(): Promise<SampleRoutesResponse> {
  const [easy, ranked] = await Promise.all([
    (easyRoutesPromise ??= buildEasySampleRoutes()),
    fetchRankedRoutes(),
  ])

  const dungeons = dungeonKeys.reduce((acc, dungeonKey) => {
    acc[dungeonKey] = [...easy[dungeonKey], ...(ranked?.byDungeon[dungeonKey] ?? [])]
    return acc
  }, {} as SampleRoutes)

  return { rankingsVersion: ranked?.version ?? null, dungeons }
}
