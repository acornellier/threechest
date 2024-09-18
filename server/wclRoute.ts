import type { WclEventSimplified, WclResult } from '../src/util/wclCalc.ts'
import { uniqBy } from '../src/util/nodash.ts'
import { dungeons } from '../src/data/dungeons.ts'
import fs from 'fs'
import { cacheFolder } from './files.ts'
import { fetchWcl } from './wcl.ts'
import * as path from 'path'

const wclRouteCacheFolder = path.join(cacheFolder, 'wclRoute')
const batchSize = 82

type WclEnemyNpc = {
  id: number
  gameID: number
  minimumInstanceID: number
  maximumInstanceID: number
}

type WclPull = {
  enemyNPCs: Array<WclEnemyNpc>
}

type WclRoute = {
  id: number
  startTime: number
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
  mapID: number
  source?: { id: number; name: string }
  target?: { id: number }
  amount?: number
}

async function getRoute(code: string, fightId: 'last' | string | number): Promise<WclRoute> {
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

  const json = await fetchWcl<{ reportData: { report: { fights: WclRoute[] } } }>(query)
  const fights = json.reportData.report.fights
  fights.reverse()
  return fights.find(
    ({ id, encounterID }) => !!encounterID && (fightId === 'last' || id === Number(fightId)),
  )!
}

type WclEnemy = { gameId: number; actorId: number; instanceId: number }
type EnemyRequest = { actorId: number; instanceId: number }

async function getFirstEvents(code: string, fight: WclRoute, enemies: EnemyRequest[]) {
  const events: WclEvent[] = []
  const eventStart = fight.startTime + 10_000 // ignore first 10 seconds, mobs do random casts

  console.time('query time')
  for (let start = 0; start < enemies.length; start += batchSize) {
    const end = Math.min(start + batchSize, enemies.length)
    const enemyBatch = enemies.slice(start, end)

    const subQueries = enemyBatch
      .map(({ actorId, instanceId }, idx) => {
        return `
      c${idx}: events(
        fightIDs: ${fight.id}
        sourceID: ${actorId}
        sourceInstanceID: ${instanceId}
        dataType: Casts
        hostilityType: Enemies
        limit: 2
        startTime: ${eventStart}
        endTime: 9999999999
        includeResources: true
      ) {
        data
      }

      d${idx}: events(
        fightIDs: ${fight.id}
        targetID: ${actorId}
        targetInstanceID: ${instanceId}
        limit: 3
        dataType: DamageDone
        startTime: ${eventStart}
        endTime: 9999999999
        includeResources: true
        useActorIDs: false
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

    const json = await fetchWcl<{ reportData: { report: Record<string, { data: WclEvent[] }> } }>(
      query,
    )

    const resultsMap = json.reportData.report

    const newEvents = enemyBatch
      .map((_, idx) => {
        const castsData = resultsMap[`c${idx}`]!.data.filter(({ targetID }) => targetID !== -1)
        const damageData = resultsMap[`d${idx}`]!.data.filter(
          ({ source, amount }) => source?.name !== 'Bloodworm' && amount,
        ).map((event) => ({
          ...event,
          sourceID: event.source?.id ?? event.sourceID,
          targetID: event.target?.id ?? event.targetID,
        }))

        const firstCast = castsData.find(({ x, y }) => x && y)
        const firstDamage = damageData.find(({ x, y }) => x && y)
        if (firstCast && firstDamage) {
          // Cast data is more useful, so take it over damage data even if it's 3 seconds later
          return firstCast.timestamp - 3000 < firstDamage.timestamp ? firstCast : firstDamage
        } else if (firstCast || firstDamage) {
          return firstCast ?? firstDamage
        } else {
          // No events with coordinates found
          return damageData[0] ?? castsData[0]
        }
      })
      .filter(Boolean)

    events.push(...newEvents)
  }
  console.timeEnd('query time')
  console.log(`spent points: ${enemies.length * 2}`)

  return events
}

export async function getWclRoute(
  code: string,
  fightId: 'last' | string | number,
): Promise<{ result: WclResult; cached: boolean }> {
  const file = `${wclRouteCacheFolder}/${code}-${fightId}.json`
  const hasCache = fs.existsSync(file)

  console.log('getWclRoute', code, fightId, hasCache)

  if (hasCache) {
    const result = JSON.parse(fs.readFileSync(file, 'utf8')) as WclResult
    return { result, cached: true }
  }

  const fight = await getRoute(code, fightId)

  const dungeon = dungeons.find((dungeon) => dungeon.wclEncounterId === fight.encounterID)
  if (!dungeon) throw new Error(`Dungeon not supported, WCL encounter ID ${fight.encounterID}`)

  let enemies: WclEnemy[] = fight.dungeonPulls.flatMap(({ enemyNPCs }) =>
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

  const firstEvents = await getFirstEvents(code, fight, enemies)

  const firstPositions = firstEvents
    .map<WclEventSimplified | null>((event) => {
      const { timestamp, targetID, targetInstance, sourceID, sourceInstance, x, y, mapID } = event

      const actorId = event.type === 'cast' ? sourceID : targetID
      const instanceId = event.type === 'cast' ? sourceInstance : targetInstance
      const matchingEnemy = enemies.find((enemy) => enemy.actorId === actorId)

      if (!matchingEnemy) {
        console.error(`Could not find actorId ${actorId} in enemy list`)
        return null
      }

      return {
        timestamp: timestamp - fight.startTime,
        gameId: matchingEnemy.gameId,
        x,
        y,
        mapID,
        name: `${dungeon.mobSpawnsList.find(({ mob }) => mob.id === matchingEnemy.gameId)?.mob.name} ${instanceId}`,
      }
    })
    .filter(Boolean)

  firstPositions.sort((a, b) => a.timestamp - b.timestamp)

  let idx = 1
  for (const pos of firstPositions) {
    if (pos.x && pos.y && pos.mapID) pos.id = idx++
  }

  const result: WclResult = {
    code,
    fightId: fight.id,
    encounterID: fight.encounterID,
    keystoneLevel: fight.keystoneLevel,
    events: firstPositions,
  }

  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, JSON.stringify(result))

  return { result, cached: false }
}
