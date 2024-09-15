import sampleRoutesUncompiled from '../src/data/sampleRoutes/sampleRoutesUncompiled.js'

export default async function wclRouteApi(request, response) {
  const routes = await sampleRoutesUncompiled()
  response.status(200).json(routes)
}
