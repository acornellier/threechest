import { MdtRoute } from '../util/types.ts'

const importUrl =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:6173/api/decodeRoute'
    : '/api/decodeRoute'

export const importRouteApi = (str: string): Promise<MdtRoute> =>
  fetch(importUrl, {
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ str }),
  }).then(async (res) => {
    if (res.ok) return res.json()
    else throw await res.text()
  })
