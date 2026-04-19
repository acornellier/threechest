import type { DeathEvent, WclEventSimplified, WclResult } from '../src/util/wclCalc.ts'
import { uniqBy } from '../src/util/nodash.ts'
import { dungeons } from '../src/data/dungeons.ts'
import fs from 'fs'
import { cacheFolder } from './files.ts'
import { fetchWcl, getDeathEvents, getFight, type WclFight } from './wcl.ts'
import * as path from 'path'

const wclRouteCacheFolder = path.join(cacheFolder, 'wclRoute')

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
  target?: { id: number; type: string | 'NPC' }
  amount?: number
}

type WclEnemy = { gameId: number; actorId: number; instanceId: number }

type EventsByKey = Map<string, WclEvent[]>

function enemyKey(actorId: number, instanceId: number) {
  return `${actorId}_${instanceId}`
}

async function fetchEventsByActor(
  code: string,
  fight: WclFight,
  eventStart: number,
  dataType: 'Casts' | 'DamageDone',
  enemies: WclEnemy[],
): Promise<EventsByKey> {
  const uniqueGameIds = [...new Set(enemies.map((e) => e.gameId))].join(',')
  const isSource = dataType === 'Casts'
  const actorRole = isSource ? 'source' : 'target'
  const byKey: EventsByKey = new Map()
  let startTime = eventStart
  let allCovered = false

  while (!allCovered) {
    const query = `
query {
  reportData {
    report(code: "${code}") {
      events(
        fightIDs: ${fight.id}
        dataType: ${dataType}
        ${isSource ? 'hostilityType: Enemies' : ''}
        startTime: ${startTime}
        endTime: 9999999999
        includeResources: true
        useActorIDs: false
        limit: 10000
        filterExpression: "${actorRole}.id IN (${uniqueGameIds})"
      ) {
        data
        nextPageTimestamp
      }
    }
  }
}`

    const json = await fetchWcl<{
      reportData: { report: { events: { data: WclEvent[]; nextPageTimestamp?: number } } }
    }>(query)

    const { data, nextPageTimestamp } = json.reportData.report.events

    for (const event of data) {
      const actorId = isSource
        ? event.source?.id ?? event.sourceID
        : event.target?.id ?? event.targetID
      const instanceId = isSource ? event.sourceInstance ?? 1 : event.targetInstance ?? 1
      const key = enemyKey(actorId, instanceId)
      if (!byKey.has(key)) {
        byKey.set(key, [])
      }
      byKey.get(key)!.push(event)
    }

    if (!nextPageTimestamp) break

    allCovered = enemies.every(({ actorId, instanceId }) =>
      (byKey.get(enemyKey(actorId, instanceId)) ?? []).some(({ x, y }) => x && y),
    )

    startTime = nextPageTimestamp
  }

  return byKey
}

async function getFirstEvents(code: string, fight: WclFight, enemies: WclEnemy[]) {
  const eventStart = fight.startTime + 10_000 // ignore first 10 seconds, mobs do random casts

  console.time('query time')

  const [castsByKey, damageByKey] = await Promise.all([
    fetchEventsByActor(code, fight, eventStart, 'Casts', enemies),
    fetchEventsByActor(code, fight, eventStart, 'DamageDone', enemies),
  ])

  const events = enemies
    .map(({ actorId, instanceId }) => {
      const key = enemyKey(actorId, instanceId)

      const castsData = (castsByKey.get(key) ?? [])
        .filter(({ target }) => target?.id !== -1 && target?.type !== 'NPC')
        .map((event) => ({
          ...event,
          sourceID: event.source?.id ?? event.sourceID,
          targetID: event.target?.id ?? event.targetID,
        }))

      const damageData = (damageByKey.get(key) ?? [])
        .filter(({ source, amount }) => source?.name !== 'Bloodworm' && amount)
        .map((event) => ({
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

  console.timeEnd('query time')

  return events
}

async function getLustEvents(code: string, fight: WclFight) {
  const query = `query {
  reportData {
    report(code:"${code}") {
      events(
        fightIDs: ${fight.id}
        dataType: Casts
        hostilityType: Friendlies
        filterExpression: "ability.id=272678 or ability.id=390386 or ability.id=80353 or ability.id=32182 or ability.id=2825"
        includeResources: true
      ) {
        data
      }
    }
  }
}`

  const json = await fetchWcl<{ reportData: { report: { events: { data: WclEvent[] } } } }>(query)

  return json.reportData.report.events.data
}

export async function getWclRoute(
  code: string,
  fightId: 'last' | string | number,
  ignoreCache: boolean = false,
): Promise<{ result: WclResult; cached: boolean }> {
  const file = `${wclRouteCacheFolder}/${code}-${fightId}.json`
  const hasCache = !ignoreCache && fs.existsSync(file)

  console.log(`getWclRoute ${code}-${fightId} hasCache: ${hasCache}`)

  if (hasCache) {
    const result = JSON.parse(fs.readFileSync(file, 'utf8')) as WclResult
    return { result, cached: true }
  }

  const fight = await getFight(code, fightId)

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
        instanceId: instanceId,
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

  const lustEvents = await getLustEvents(code, fight)

  const wclDeathEvents = await getDeathEvents(code, fight)
  const deathEvents = wclDeathEvents
    .map<DeathEvent | null>((event) => {
      const matchingEnemy = enemies.find((enemy) => enemy.actorId === event.targetID)

      if (!matchingEnemy) return null

      return {
        timestamp: event.timestamp - fight.startTime,
        gameId: matchingEnemy.gameId,
        instanceId: event.targetInstance,
      }
    })
    .filter(Boolean)

  const result: WclResult = {
    code,
    fightId: fight.id,
    encounterID: fight.encounterID,
    keystoneLevel: fight.keystoneLevel,
    events: firstPositions,
    lustEvents,
    deathEvents,
  }

  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, JSON.stringify(result))

  return { result, cached: false }
}
