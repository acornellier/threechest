import { Route } from '../code/types.ts'
import { routeToMdtRoute } from '../code/mdtUtil.ts'

const exportUrl =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000/api/exportRoute'
    : '/api/importRoute'

export const exportRoute = (route: Route) =>
  fetch(exportUrl, {
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mdtRoute: routeToMdtRoute(route) }),
  }).then((res) => res.json())
