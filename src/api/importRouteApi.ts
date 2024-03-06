import { MdtRoute } from '../code/types.ts'

const importUrl =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:6173/api/importRoute'
    : '/api/importRoute'

export const importRouteApi = (str: string): Promise<MdtRoute> =>
  fetch(importUrl, {
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ str }),
  }).then((res) => res.json())
