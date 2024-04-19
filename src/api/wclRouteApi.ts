import { WclResult, WclUrlInfo } from '../util/wclCalc.ts'
import { isDev } from '../util/isDev.ts'

const importUrl = isDev ? 'http://localhost:6173/api/wclRoute' : '/api/wclRoute'

export const wclRouteApi = (urlInfo: WclUrlInfo): Promise<WclResult> =>
  fetch(importUrl, {
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(urlInfo),
  }).then(async (res) => {
    if (res.ok) return res.json()
    else throw await res.text()
  })
