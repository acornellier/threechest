import { Route } from '../code/types.ts'
import { routeToMdtRoute } from '../code/mdtUtil.ts'

const exportUrl =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:6173/api/exportRoute'
    : '/api/encodeRoute'

export const exportRouteApi = (route: Route) =>
  fetch(exportUrl, {
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mdtRoute: routeToMdtRoute(route) }),
  }).then(async (res) => {
    if (res.ok) return res.json()
    else throw await res.text()
  })
