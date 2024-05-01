import type { Route } from '../util/types.ts'
import { routeToMdtRoute } from '../util/mdtUtil.ts'
import { apiBaseUrl } from './api.ts'

export const exportRouteApi = (route: Route) =>
  fetch(`${apiBaseUrl}/encodeRoute`, {
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mdtRoute: routeToMdtRoute(route) }),
  }).then(async (res) => {
    if (res.ok) return (await res.json()) as string
    else throw await res.text()
  })
