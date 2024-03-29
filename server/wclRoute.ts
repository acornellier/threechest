import { WclEventSimplified, WclResult } from '../src/util/wclUtil.ts'
import { uniqBy } from '../src/util/nodash.ts'
import { getWclToken } from '../scripts/wclToken.ts'
import { dungeons } from '../src/data/dungeons.ts'

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

  const token = await getWclToken()
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

    const token = await getWclToken()

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

  const dungeon = dungeons.find((dungeon) => dungeon.wclEncounterId === wclRoute.encounterID)
  if (!dungeon) throw new Error(`Dungeon not supported, WCL encounter ID ${wclRoute.encounterID}`)

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

  // Filter out mobs that aren't in the route, or have no count (unless they're a boss)
  enemies = enemies.filter((enemy) =>
    dungeon.mobSpawnsList.some(
      ({ mob }) => mob.id === enemy.gameID && (mob.count > 0 || mob.isBoss),
    ),
  )

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

  const result: WclResult = {
    code,
    fightId: Number(fightId),
    encounterID: wclRoute.encounterID,
    keystoneLevel: wclRoute.keystoneLevel,
    events: firstPositions,
  }

  //   const __filename = fileURLToPath(import.meta.url)
  //   const __dirname = path.dirname(__filename)
  //   fs.writeFileSync(
  //     `${__dirname}/../src/util/wclTest.ts`,
  //     `
  // import { WclResult } from './wclUtil.ts'
  //
  // export const wclTest: WclResult = ${JSON.stringify(result)}
  // `,
  //   )

  return result
}
