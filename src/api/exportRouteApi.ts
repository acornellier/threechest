import { Route } from '../util/types.ts'
import { routeToMdtRoute } from '../util/mdtUtil.ts'
import { isDev } from '../util/isDev.ts'

const exportUrl = isDev ? 'http://localhost:6173/api/encodeRoute' : '/api/encodeRoute'

export const exportRouteApi = (route: Route) =>
  fetch(exportUrl, {
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mdtRoute: routeToMdtRoute(route) }),
  }).then(async (res) => {
    if (res.ok) return res.json()
    else throw await res.text()
  })
