import type { ServerResponse } from 'http'
import type { Plugin } from 'vite'
import { type DungeonKey, dungeonKeys } from '../src/data/dungeonKeys.ts'
import {
  blobPrefix,
  dungeonRouteFiles,
  type RankingsManifest,
  readDungeonRoutes,
} from '../scripts/rankingsFiles.ts'

/** Stands in for uploadRankings.ts's content hash. Never published, so it never has to change. */
const localVersion = 'local'

const manifestUrlPath = `/${blobPrefix}/manifest.json`

const dungeonUrlPrefix = `/${blobPrefix}/${localVersion}/`

const isDungeonKey = (value: string): value is DungeonKey =>
  (dungeonKeys as readonly string[]).includes(value)

/** Every dungeon that currently has at least one file in its local sampleRoutes folder. */
const populatedDungeonKeys = (): DungeonKey[] =>
  dungeonKeys.filter((dungeonKey) => dungeonRouteFiles(dungeonKey).length > 0)

function sendJson(res: ServerResponse, body: string) {
  res.setHeader('Content-Type', 'application/json')
  // Matches vite's own dev responses, in case the app is opened on a different host than the
  // VITE_RANKINGS_BASE_URL it was built with.
  res.setHeader('Access-Control-Allow-Origin', '*')
  // Re-running `yarn r` should only need a browser reload, not a dev server restart.
  res.setHeader('Cache-Control', 'no-store')
  res.end(body)
}

/**
 * Serves src/data/sampleRoutes/<dungeon>/ in the Vercel Blob store's layout, so pointing
 * VITE_RANKINGS_BASE_URL at the dev server previews a local `yarn r` run without publishing to
 * production. Dev only.
 */
export function localRankingsPlugin(): Plugin {
  return {
    name: 'local-rankings',
    apply: 'serve',
    configureServer(server) {
      // Registered directly rather than via the returned-function form, otherwise the SPA html
      // fallback claims these paths first.
      server.middlewares.use((req, res, next) => {
        const urlPath = req.url?.split('?')[0]
        if (req.method !== 'GET' || urlPath === undefined) {
          next()
          return
        }

        if (urlPath === manifestUrlPath) {
          const dungeons: RankingsManifest['dungeons'] = {}
          for (const dungeonKey of populatedDungeonKeys()) {
            // Relative, so the client resolves it against the page origin.
            dungeons[dungeonKey] = `${dungeonUrlPrefix}${dungeonKey}.json`
          }

          sendJson(res, JSON.stringify({ version: localVersion, dungeons }))
          return
        }

        if (!urlPath.startsWith(dungeonUrlPrefix) || !urlPath.endsWith('.json')) {
          next()
          return
        }

        const dungeonKey = urlPath.slice(dungeonUrlPrefix.length, -'.json'.length)
        if (!isDungeonKey(dungeonKey)) {
          res.statusCode = 404
          res.end('Unknown dungeon key')
          return
        }

        sendJson(res, JSON.stringify(readDungeonRoutes(dungeonKey)))
      })

      const populated = populatedDungeonKeys()
      if (populated.length) {
        server.config.logger.info(
          `Serving local rankings for: ${populated.join(', ')} ` +
            `(point VITE_RANKINGS_BASE_URL at this dev server to use them)`,
        )
      } else {
        server.config.logger.info(
          'No local rankings found — run `yarn rankings:download` or `yarn r` to populate them',
        )
      }
    },
  }
}
