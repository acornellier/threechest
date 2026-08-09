import type { DungeonKey } from '../data/dungeonKeys.ts'
import type { SampleRoute } from '../util/types.ts'
import { rankingsBaseUrl } from './api.ts'

interface RankingsManifest {
  version: string
  dungeons: Partial<Record<DungeonKey, string>>
}

/**
 * The manifest is short-lived and points at immutable, version-hashed dungeon files. That's what
 * keeps everyone who loads at the same moment on a consistent set across all dungeons, without
 * giving up long CDN caching on the payloads themselves.
 */
const manifestUrl = () => `${rankingsBaseUrl}/rankings/manifest.json`

let manifestPromise: Promise<RankingsManifest> | undefined
const dungeonPromises = new Map<DungeonKey, Promise<SampleRoute[]>>()

const fetchJson = async <T>(url: string, init?: RequestInit): Promise<T> => {
  const res = await fetch(url, init)
  if (!res.ok) {
    throw new Error(`${url} responded ${res.status} ${res.statusText}`)
  }

  return (await res.json()) as T
}

/**
 * Ranked routes for one dungeon, cached per dungeon for the life of the page. Failures are not
 * cached, so reopening the dropdown retries.
 */
export function fetchRankedRoutes(dungeonKey: DungeonKey): Promise<SampleRoute[]> {
  const cached = dungeonPromises.get(dungeonKey)
  if (cached) {
    return cached
  }

  if (!rankingsBaseUrl) {
    return Promise.reject(new Error('VITE_RANKINGS_BASE_URL is not set'))
  }

  manifestPromise ??= fetchJson<RankingsManifest>(manifestUrl(), { cache: 'no-store' })

  const promise = manifestPromise
    .then((manifest) => {
      const url = manifest.dungeons[dungeonKey]
      return url ? fetchJson<SampleRoute[]>(url) : []
    })
    .catch((e: unknown) => {
      dungeonPromises.delete(dungeonKey)
      manifestPromise = undefined
      throw e
    })

  dungeonPromises.set(dungeonKey, promise)
  return promise
}
