import { WclEventSimplified, WclResult } from '../src/util/wclUtil.ts'
import { uniqBy } from '../src/util/nodash.ts'
import fs from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'

const token =
  'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI5YjgzMmFjMC05OTE3LTRjMzgtOTVhMy1kNmRkOTIwOTM5YzMiLCJqdGkiOiIxZjI0NGVmN2RlZGY2YTg3YTUwMjUyZWI5YTRkZGZhYzdjMDI0ZDU1YTE5ODU2MDgzMjMxMjIxMzhjOWRiMDJjMDYzOGZjZGExOGNlZmQzMiIsImlhdCI6MTcwOTg3NzY0NC40MzMzNjksIm5iZiI6MTcwOTg3NzY0NC40MzMzNzMsImV4cCI6MTc0MDk4MTY0NC40MjUxNTgsInN1YiI6IiIsInNjb3BlcyI6WyJ2aWV3LXVzZXItcHJvZmlsZSIsInZpZXctcHJpdmF0ZS1yZXBvcnRzIl19.Ja9sun9mng7q_KbszrB5Cq-viYk3aWQ9qVx5vEq-q_06xYP1VNwjcPsLOXxUHpueokI9HKgtPoa4N2THj6Tuhgv8O8y5sL7K7zO6XEwOjTpvf3CUnCob4FcHOsBq8ARUGk_DTs38eYeXBkHLX_6aoCIOE6pkUQA-5nA2Rj7b5iZ8LE1mLuloDMnQx2od45wKUQoe57uuabY8yGP1J5pRJQD53jM8t7IV2I4I_oatVi9MtsuLqPjJWZh4q_f59UvZU4dhEn9ab3K7XO8iesO4KGf9VYWsOxz0aY-TwO19j4bt6iZ1Zv147PK2BzoQ9YkeVvuHY5SY92mfeK7Eeoqq69lpsd2wiw3BAsdYTPh9YLtxL3TEJCQXBrVtfWrTuhg5RbwWm_FsPLtCq-LIb6sfhKlvpVFGc9zsBqh8rnFhLYgd9jpGiexgXjF3rTto-rpEimNt7bLmLkl8SNJixYJBSbdIHdLIykQwDsbjdJtQzDGrF61j5-Sx6gmks1qPcW1AV_y0dz8TCjrZjg9F6DCJzYqmQMvrYc_RmEY3e72AJszaxCwadDvP2v_-2abiF51jdHd6QMvieIkIWHeVQdwzf4H6ww19hVNEJg3n8TDAeJNNWjuaabtZrC9HudAzrruQDxtjTKvrd6q7uPDHA66-58Wd1SXPyGylJ4VIMPZreF4'

type WclEnemyNpc = {
  id: number
  gameID: number
  minimumInstanceID: number
  maximumInstanceID: number
}

type WclPull = {
  enemyNPCs: Array<WclEnemyNpc>
}

export type WclRoute = {
  encounterID: number
  keystoneLevel: number
  dungeonPulls: WclPull[]
}

type WclEvent = {
  timestamp: number
  targetID: number
  targetInstance?: number
  x: number
  y: number
}

async function getRoute(code: string, fightId: string | number) {
  const query = `
query {
  reportData {
    report(code:"${code}") {
      fights(fightIDs:${fightId}) {
        encounterID
        keystoneLevel
        dungeonPulls {
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

  const data = await fetch('https://www.warcraftlogs.com/api/v2/client', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query }),
  })

  const json = await data.json()

  return json.data.reportData.report.fights[0] as WclRoute
}

async function getFirstEvents(
  code: string,
  fightId: string | number,
  enemies: Array<{ actorId: number; instanceId: number }>,
) {
  const events: WclEvent[] = []

  console.time('total')
  const batchSize = 100
  for (let i = 0; i < enemies.length; i += batchSize) {
    const start = i
    const end = Math.min(i + batchSize, enemies.length)
    const subQueries = enemies
      .slice(start, end)
      .map(({ actorId, instanceId }, idx) => {
        return `
      _${idx}: events(
        fightIDs: ${fightId}
        limit: 1
        targetID: ${actorId}
        targetInstanceID: ${instanceId}
        dataType: DamageDone
        includeResources: true
      ) {
        data
      }`
      })
      .join('\n')

    const query = `
query {
  reportData {
    report(code:"${code}") {
      ${subQueries}
    }
  }
}`

    console.time(`query ${start}-${end}`)
    const data = await fetch('https://www.warcraftlogs.com/api/v2/client', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ query }),
    })
    console.timeEnd(`query ${start}-${end}`)

    const json = await data.json()
    const resultsMap = json.data.reportData.report
    const newEvents = Object.values(resultsMap)
      .map((v: any) => v.data[0])
      .filter(Boolean) as WclEvent[]
    events.push(...newEvents)
  }
  console.timeEnd('total')

  return events
}

export async function getWclRoute(code: string, fightId: string | number): Promise<WclResult> {
  const wclRoute = await getRoute(code, fightId)

  let enemies = wclRoute.dungeonPulls.flatMap(({ enemyNPCs }) =>
    enemyNPCs.flatMap(({ id, gameID, minimumInstanceID, maximumInstanceID }) =>
      Array.from({ length: maximumInstanceID - minimumInstanceID + 1 }, (_, i) => ({
        actorId: id,
        gameID,
        instanceId: minimumInstanceID + i,
      })),
    ),
  )

  enemies = uniqBy(enemies, ['actorId', 'instanceId'])

  const firstEvents = await getFirstEvents(code, fightId, enemies)

  const firstPositions = firstEvents
    .map(({ timestamp, targetID, targetInstance, x, y }) => {
      const gameId = enemies.find(({ actorId }) => actorId === targetID)?.gameID
      if (!gameId) {
        console.error(`Could not find targetID ${targetID} in enemy list`)
        return null
      }
      return {
        timestamp,
        gameId,
        actorId: targetID,
        instanceId: targetInstance,
        x,
        y,
      }
    })
    .filter(Boolean) as WclEventSimplified[]

  const result = {
    encounterID: wclRoute.encounterID,
    keystoneLevel: wclRoute.keystoneLevel,
    events: firstPositions,
  }

  const __filename = fileURLToPath(import.meta.url)
  const __dirname = path.dirname(__filename)
  fs.writeFileSync(
    `${__dirname}/../src/util/wclTest.ts`,
    `
import { WclResult } from './wclUtil.ts'

export const wclTest: WclResult = ${JSON.stringify(result)}
`,
  )

  return result
}
