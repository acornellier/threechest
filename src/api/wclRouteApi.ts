import { isDev } from '../util/dev.ts'
import { WclResult } from '../util/wclUtil.ts'

const importUrl = isDev ? 'http://localhost:6173/api/wclRoute' : '/api/wclRoute'

export const wclRouteApi = (code: string, fightId: number): Promise<WclResult> =>
  fetch(importUrl, {
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, fightId }),
  }).then(async (res) => {
    if (res.ok) return res.json()
    else throw await res.text()
  })
