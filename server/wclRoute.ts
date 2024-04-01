import type { WclEventSimplified, WclResult } from '../src/util/wclCalc.ts'
import { uniqBy } from '../src/util/nodash.ts'
import { getWclToken } from './wclToken.ts'
import { dungeons } from '../src/data/dungeons.ts'
import fs from 'fs'
import { getDirname } from './files.ts'

const dirname = getDirname(import.meta.url)

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
  type: 'damage' | 'cast'
  targetID: number
  targetInstance?: number
  sourceID: number
  sourceInstance?: number
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
  if (json.error) {
    throw new Error(json.error)
  }

  return json.data.reportData.report.fights[0] as WclRoute
}

type WclEnemy = { gameId: number; actorId: number; instanceId: number }
type EnemyRequest = { actorId: number; instanceId: number }

async function getFirstEvents(code: string, fightId: string | number, enemies: EnemyRequest[]) {
  const events: WclEvent[] = []

  console.time('total')
  const batchSize = 50
  for (let start = 0; start < enemies.length; start += batchSize) {
    const end = Math.min(start + batchSize, enemies.length)
    const enemyBatch = enemies.slice(start, end)

    const subQueries = enemyBatch
      .map(({ actorId, instanceId }, idx) => {
        return `
      c${idx}: events(
        fightIDs: ${fightId}
        sourceID: ${actorId}
        sourceInstanceID: ${instanceId}
        limit: 2
        dataType: Casts
        hostilityType: Enemies
        includeResources: true
      ) {
        data
      }

      d${idx}: events(
        fightIDs: ${fightId}
        targetID: ${actorId}
        targetInstanceID: ${instanceId}
        limit: 3
        dataType: DamageDone
        includeResources: true
      ) {
        data
      }
      `
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

    fs.writeFileSync(`${dirname}/foo_${start}.json`, query)

    const token = await getWclToken()

    const logStr = `query ${start}-${end}`
    console.time(logStr)
    const data = await fetch('https://www.warcraftlogs.com/api/v2/client', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ query }),
    })
    console.timeEnd(logStr)

    const json = await data.json()
    if (json.error) {
      throw new Error(json.error)
    }

    const resultsMap = json.data.reportData.report as Record<string, { data: WclEvent[] }>

    const newEvents = enemyBatch
      .map((_, idx) => {
        const castsData = resultsMap[`c${idx}`]!.data
        const damageData = resultsMap[`d${idx}`]!.data
        const firstCast = castsData.find(({ x, y }) => x && y)
        const firstDamage = damageData.find(({ x, y }) => x && y)
        if (firstCast && firstDamage) {
          // Cast data is more useful, so take it over damage data even if it's 3 seconds later
          return firstCast.timestamp - 3000 < firstDamage.timestamp ? firstCast : firstDamage
        } else {
          return firstCast ?? firstDamage
        }
      })
      .filter(Boolean) as WclEvent[]

    events.push(...newEvents)
  }
  console.timeEnd('total')
  console.log(`spent points: ${enemies.length * 2}`)

  return events
}

export async function getWclRoute(code: string, fightId: string | number): Promise<WclResult> {
  const wclRoute = await getRoute(code, fightId)

  const dungeon = dungeons.find((dungeon) => dungeon.wclEncounterId === wclRoute.encounterID)
  if (!dungeon) throw new Error(`Dungeon not supported, WCL encounter ID ${wclRoute.encounterID}`)

  let enemies: WclEnemy[] = wclRoute.dungeonPulls.flatMap(({ enemyNPCs }) =>
    enemyNPCs.flatMap(({ id, gameID, minimumInstanceID, maximumInstanceID }) =>
      Array.from({ length: maximumInstanceID - minimumInstanceID + 1 }, (_, i) => ({
        actorId: id,
        gameId: gameID,
        instanceId: minimumInstanceID + i,
      })),
    ),
  )

  enemies = uniqBy(enemies, ['actorId', 'instanceId'])

  // Filter out mobs that aren't in the route, or have no count (unless they're a boss)
  enemies = enemies.filter((enemy) =>
    dungeon.mobSpawnsList.some(
      ({ mob }) => mob.id === enemy.gameId && (mob.count > 0 || mob.isBoss),
    ),
  )

  const firstEvents = await getFirstEvents(code, fightId, enemies)

  let firstPositions = firstEvents
    .map((event) => {
      const { timestamp, targetID, targetInstance, sourceID, sourceInstance, x, y } = event

      const actorId = event.type === 'cast' ? sourceID : targetID
      const instanceId = event.type === 'cast' ? sourceInstance : targetInstance
      const matchingEnemy = enemies.find((enemy) => enemy.actorId === actorId)

      if (!matchingEnemy) {
        console.error(`Could not find actorId ${actorId} in enemy list`)
        return null
      }

      return {
        timestamp,
        gameId: matchingEnemy.gameId,
        x,
        y,
        // TODO remove debug fields: actorId, name, and instanceId
        actorId,
        instanceId,
        name: `${dungeon.mobSpawnsList.find(({ mob }) => mob.id === matchingEnemy.gameId)?.mob.name} ${instanceId}`,
      }
    })
    .filter(Boolean) as WclEventSimplified[]

  firstPositions = firstPositions.sort((a, b) => a.timestamp - b.timestamp)

  firstPositions = firstPositions.map((event) => ({
    ...event,
    timestamp: event.timestamp - firstPositions[0]!.timestamp,
  }))

  const result: WclResult = {
    code,
    fightId: Number(fightId),
    encounterID: wclRoute.encounterID,
    keystoneLevel: wclRoute.keystoneLevel,
    events: firstPositions,
  }

  fs.writeFileSync(
    `${dirname}/../src/util/wclTestData.ts`,
    `import { WclResult } from './wclUtil.ts'

  export const wclTestData: WclResult = ${JSON.stringify(result)}
  `,
  )

  return result
}
