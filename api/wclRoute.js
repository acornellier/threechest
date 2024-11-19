import { getWclRoute } from '../dist/vercelServer.js'

export default async function wclRouteApi(request, response) {
  try {
    const route = await getWclRoute(request.body.code, request.body.fightId)
    response.status(200).json(route)
  } catch (err) {
    response.status(422).send(err.message)
  }
}
