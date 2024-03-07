import { decodeRoute, DecodingError } from '../server/decodeRoute.js'

export default async function importRouteApi(request, response) {
  try {
    const route = await decodeRoute(request.body.str)
    response.status(200).json(route)
  } catch (err) {
    if (err instanceof DecodingError) {
      response.status(422).send(err.message)
    } else {
      throw err
    }
  }
}
