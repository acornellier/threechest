import { getWclToken } from './wclToken.ts'
import type { WclDeathEvent } from '../src/util/wclCalc.ts'

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

type WclEnemyNpc = {
  id: number
  gameID: number
  minimumInstanceID: number
  maximumInstanceID: number
}

type WclPull = {
  name: string
  enemyNPCs: Array<WclEnemyNpc>
  startTime: number
  endTime: number
}

export interface WclFight {
  id: number
  startTime: number
  encounterID: number
  keystoneLevel: number
  dungeonPulls: WclPull[]
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

export async function getFight(code: string, fightId: 'last' | string | number): Promise<WclFight> {
  const query = `
query {
  reportData {
    report(code:"${code}") {
      fights {
        id
        startTime
        encounterID
        keystoneLevel
        dungeonPulls {
          name
          startTime
          endTime
          enemyNPCs {
            id
            gameID
            minimumInstanceID
            maximumInstanceID
          }
        } 
      }
    }
  }
}
`

  const json = await fetchWcl<{ reportData: { report: { fights: WclFight[] } } }>(query)
  const fights = json.reportData.report.fights
  fights.reverse()
  return fights.find(
    ({ id, encounterID }) => !!encounterID && (fightId === 'last' || id === Number(fightId)),
  )!
}

export async function getDeathEvents(code: string, fight: WclFight) {
  const query = `
query {
  reportData {
    report(code: "${code}") {
      events(fightIDs: [${fight.id}], dataType: Deaths, hostilityType: Enemies) {
        data
      }
    }
  }
}`

  const json = await fetchWcl<{ reportData: { report: { events: { data: WclDeathEvent[] } } } }>(
    query,
  )
  return json.reportData.report.events.data
}
