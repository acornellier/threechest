import { getWclToken } from './wclToken.ts'

interface WclJson<T> {
  error?: string
  errors?: Array<{ message: string }>
  data: T
}

export interface PagedEventsQuery<TEvent> {
  reportData: {
    report: {
      events: {
        data: TEvent[]
        nextPageTimestamp: number
      }
    }
  }
}

export interface TableQuery {
  reportData: {
    report: {
      table: {
        data: {
          entries: any[]
        }
      }
    }
  }
}

export async function fetchWcl<T>(query: string): Promise<T> {
  const token = await getWclToken()
  const data = await fetch('https://www.warcraftlogs.com/api/v2/client', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query }),
  })

  const json = (await data.json()) as WclJson<T>

  const error = json.error ?? json.errors?.[0]?.message
  if (error) {
    throw new Error(error)
  }

  return json.data
}
