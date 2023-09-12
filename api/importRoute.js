import { importRoute } from '../src/server/importRoute.js'

export default async function importRouteApi(request, response) {
  const route = await importRoute(request.body.str)
  response.status(200).json(route)
}
