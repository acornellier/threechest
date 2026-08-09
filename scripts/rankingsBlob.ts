import DotenvFlow from 'dotenv-flow'
import { BlobNotFoundError, get } from '@vercel/blob'
import { isProd } from '../src/util/isDev.ts'
import { manifestPath, type RankingsManifest } from './rankingsFiles.ts'

if (!isProd) {
  DotenvFlow.config()
}

if (!process.env.BLOB_READ_WRITE_TOKEN) {
  throw new Error('BLOB_READ_WRITE_TOKEN is not set (add it to .env.local or the CI secrets)')
}

/**
 * Reads the published manifest straight from origin storage.
 *
 * `useCache: false` matters: the manifest is CDN-cached (60s, the Vercel Blob minimum), and this
 * value decides both whether an upload is a no-op and which older version the prune keeps. Reading
 * a stale one makes back-to-back runs republish, and could prune a version clients still resolve.
 * The browser deliberately does use the cached copy — see src/api/rankingsApi.ts.
 */
export async function fetchCurrentManifest(): Promise<RankingsManifest | null> {
  try {
    const result = await get(manifestPath, { access: 'public', useCache: false })
    if (result?.statusCode !== 200) {
      return null
    }

    return JSON.parse(await new Response(result.stream).text()) as RankingsManifest
  } catch (e) {
    if (e instanceof BlobNotFoundError) {
      return null
    }

    throw e
  }
}

export async function fetchDungeonRoutes<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`)
  }

  return (await res.json()) as T
}
