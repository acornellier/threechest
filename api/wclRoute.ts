import { getWclRoute } from '../server/wclRoute'

export default async function wclRouteApi(request: any, response: any) {
  const route = await getWclRoute(request.body.code, request.body.fightId)
  response.status(200).json(route)
}
