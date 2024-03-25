import { getWclRoute } from '../server/wclRoute.js'

export default async function wclRouteApi(request, response) {
  const route = await getWclRoute(request.body.url)
  response.status(200).json(route)
}
