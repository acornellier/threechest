import { WclRoute } from '../util/types.ts'
import { isDev } from '../util/dev.ts'

const importUrl = isDev ? 'http://localhost:6173/api/wclRoute' : '/api/wclRoute'

export const wclRouteApi = (url: string): Promise<WclRoute> =>
  fetch(importUrl, {
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  }).then(async (res) => {
    if (res.ok) return res.json()
    else throw await res.text()
  })
