import { topRoutes } from '../dist/vercelServer.js'

export default async function topRoutesFun(request, response) {
  response.status(200).json(topRoutes)
}
