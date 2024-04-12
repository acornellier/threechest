import { getWclToken } from '../server/wclToken.ts'

interface WclJson {
  error?: string
  errors?: Array<{ message: string }>
  data: any
}

export async function fetchWcl(query: string) {
  const token = await getWclToken()
  const data = await fetch('https://www.warcraftlogs.com/api/v2/client', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query }),
  })

  const json: WclJson = await data.json()

  const error = json.error ?? json.errors?.[0]?.message
  if (error) {
    throw new Error(error)
  }

  return json.data
}
