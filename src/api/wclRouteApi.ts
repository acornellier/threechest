import type { WclResult, WclUrlInfo } from '../util/wclCalc.ts'
import { apiBaseUrl } from './api.ts'

export const wclRouteApi = (urlInfo: WclUrlInfo): Promise<WclResult> =>
  fetch(`${apiBaseUrl}/wclRoute`, {
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(urlInfo),
  }).then(async (res) => {
    if (res.ok) return res.json()
    else throw await res.text()
  })
