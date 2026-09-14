import { getSampleRoutes } from '../dist/vercelServer.js'

export default async function sampleRoutesApi(request, response) {
  try {
    const sampleRoutes = await getSampleRoutes()

    // Re-merging every ranked route per request would be wasteful, so let the CDN serve it. The
    // manifest this reads is itself 60s-cached, so a short s-maxage adds little extra staleness.
    response.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=3600')
    // Public data, and matches the CORS the rankings blobs already send.
    response.setHeader('Access-Control-Allow-Origin', '*')
    response.status(200).json(sampleRoutes)
  } catch (err) {
    response.status(502).send(err.message)
  }
}
