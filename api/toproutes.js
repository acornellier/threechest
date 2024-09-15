import { topRoutes } from '../dist/vercelServer.js'

export default async function wclRouteApi(request, response) {
  response.status(200).json(topRoutes)
}
