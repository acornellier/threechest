import { exportRoute } from '../src/server/exportRoute.js'

export default async function exportRouteApi(request, response) {
  const mdtRoute = await exportRoute(request.body.mdtRoute)
  response.status(200).json(mdtRoute)
}
