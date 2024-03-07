import { encodeRoute } from '../server/encodeRoute.js'

export default async function exportRouteApi(request, response) {
  const mdtRoute = await encodeRoute(request.body.mdtRoute)
  response.status(200).json(mdtRoute)
}
