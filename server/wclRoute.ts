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
  source?: { id: number; name: string; guid?: number }
  target?: { id: number; type: string | 'NPC'; guid?: number }
  amount?: number
}

type WclEnemy = { gameId: number; actorId: number; instanceId: number }

type EventsByKey = Map<string, WclEvent[]>

function enemyKey(actorId: number, instanceId: number) {
  return `${actorId}_${instanceId}`
}

function eventEnemy(event: WclEvent, isSource: boolean) {
  const role = isSource ? event.source : event.target
  const actorId = role?.id ?? (isSource ? event.sourceID : event.targetID)
  const instanceId = (isSource ? event.sourceInstance : event.targetInstance) ?? 1
  return { actorId, instanceId, gameId: role?.guid, key: enemyKey(actorId, instanceId) }
}

async function fetchEventsByActor(
  code: string,
  fight: WclFight,
  eventStart: number,
  dataType: 'Casts' | 'DamageDone',
  countableGameIds: Set<number>,
  knownEnemies: WclEnemy[],
): Promise<EventsByKey> {
  const uniqueGameIds = [...countableGameIds].join(',')
  const isSource = dataType === 'Casts'
  const actorRole = isSource ? 'source' : 'target'
  const byKey: EventsByKey = new Map()

  const expectedKeys = new Set(
    knownEnemies.map(({ actorId, instanceId }) => enemyKey(actorId, instanceId)),
  )

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
        viewOptions: ${dataType === 'Casts' ? 1 : 0}
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
      const { gameId, key } = eventEnemy(event, isSource)
      if (!byKey.has(key)) {
        byKey.set(key, [])
      }
      byKey.get(key)!.push(event)
      if (gameId !== undefined && countableGameIds.has(gameId)) {
        expectedKeys.add(key)
      }
    }

    if (!nextPageTimestamp) break

    allCovered = [...expectedKeys].every((key) => (byKey.get(key) ?? []).some(({ x, y }) => x && y))

    startTime = nextPageTimestamp
  }

  return byKey
}

// A mob's mapID near a composite-map seam is ambiguous: its first events can be reported on a
// neighboring map before settling. Rather than guess the map here (we lack the spawn geometry to
// know which is right), we emit one candidate per distinct map the mob appears on in a short window
// from its first event, and let wclCalc pick whichever lands nearest a real spawn of that mob.
const MAP_CANDIDATE_WINDOW = 10_000

// Pick the representative event for a single map's candidates: cast data is more useful, so take it
// over damage data even if it's up to 3 seconds later. Assumes events are sorted by timestamp.
function pickRepresentative(events: WclEvent[]): WclEvent {
  const firstCast = events.find(({ type }) => type === 'cast')
  const firstDamage = events.find(({ type }) => type === 'damage')
  if (firstCast && firstDamage) {
    return firstCast.timestamp - 3000 < firstDamage.timestamp ? firstCast : firstDamage
  }
  return (firstCast ?? firstDamage)!
}

async function getFirstEvents(
  code: string,
  fight: WclFight,
  countableGameIds: Set<number>,
  knownEnemies: WclEnemy[],
) {
  const eventStart = fight.startTime + 10_000 // ignore first 10 seconds, mobs do random casts

  console.time('query time')

  const [castsByKey, damageByKey] = await Promise.all([
    fetchEventsByActor(code, fight, eventStart, 'Casts', countableGameIds, knownEnemies),
    fetchEventsByActor(code, fight, eventStart, 'DamageDone', countableGameIds, knownEnemies),
  ])

  const enemyByKey = new Map<string, WclEnemy>(
    knownEnemies.map((enemy) => [enemyKey(enemy.actorId, enemy.instanceId), enemy]),
  )
  for (const [byKey, isSource] of [
    [castsByKey, true],
    [damageByKey, false],
  ] as const) {
    for (const events of byKey.values()) {
      for (const event of events) {
        const { actorId, instanceId, gameId, key } = eventEnemy(event, isSource)
        if (gameId !== undefined && countableGameIds.has(gameId) && !enemyByKey.has(key)) {
          enemyByKey.set(key, { actorId, instanceId, gameId })
        }
      }
    }
  }
  const enemies = [...enemyByKey.values()]

  const events = enemies.flatMap(({ actorId, instanceId }) => {
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

    const coordEvents = [...castsData, ...damageData]
      .filter(({ x, y }) => x && y)
      .sort((a, b) => a.timestamp - b.timestamp)

    if (coordEvents.length === 0) {
      // No events with coordinates found
      const fallback = damageData[0] ?? castsData[0]
      return fallback ? [fallback] : []
    }

    // Emit one candidate per distinct map the mob appears on within the window from its first
    // event. wclCalc resolves the seam ambiguity by choosing the candidate nearest a real spawn.
    const windowStart = coordEvents[0]!.timestamp
    const eventsByMap = new Map<number, WclEvent[]>()
    for (const event of coordEvents) {
      if (event.timestamp > windowStart + MAP_CANDIDATE_WINDOW) break
      const list = eventsByMap.get(event.mapID) ?? []
      list.push(event)
      eventsByMap.set(event.mapID, list)
    }

    return [...eventsByMap.values()].map(pickRepresentative)
  })

  console.timeEnd('query time')

  return { events, enemies }
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

  const countableGameIds = new Set(
    dungeon.mobSpawnsList.filter(({ mob }) => mob.count > 0 || mob.isBoss).map(({ mob }) => mob.id),
  )

  const knownEnemies = uniqBy(
    [
      ...fight.dungeonPulls.flatMap(({ enemyNPCs }) =>
        enemyNPCs.flatMap(({ id, gameID, minimumInstanceID, maximumInstanceID }) =>
          Array.from({ length: maximumInstanceID - minimumInstanceID + 1 }, (_, i) => ({
            actorId: id,
            gameId: gameID,
            instanceId: minimumInstanceID + i,
          })),
        ),
      ),
    ].filter((enemy) => countableGameIds.has(enemy.gameId)),
    ['actorId', 'instanceId'],
  )

  const { events: firstEvents, enemies } = await getFirstEvents(
    code,
    fight,
    countableGameIds,
    knownEnemies,
  )

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
        actorId,
        instanceId,
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
