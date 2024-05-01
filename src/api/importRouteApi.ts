import type { MdtRoute } from '../util/types.ts'
import { apiBaseUrl } from './api.ts'

export const importRouteApi = (str: string): Promise<MdtRoute> =>
  fetch(`${apiBaseUrl}/decodeRoute`, {
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ str }),
  }).then(async (res) => {
    if (res.ok) return (await res.json()) as MdtRoute
    else throw await res.text()
  })
