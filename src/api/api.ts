import { isDev } from '../util/isDev.ts'

export const apiBaseUrl = isDev ? 'http://localhost:6173/api' : '/api'

/**
 * Public Vercel Blob store holding the WCL-ranked sample routes, published by
 * scripts/uploadRankings.ts. Not a secret — it's fetched directly by the browser. Dev points at
 * the production store, so there's no local rankings data to keep in sync.
 */
export const rankingsBaseUrl = import.meta.env.VITE_RANKINGS_BASE_URL
