import { Route, WclRoute } from './types.ts'
import { newRouteUid } from '../store/routes/routesReducer.ts'
import { wclDungeons } from '../data/wcl/wclData.ts'
import { DungeonKey, SpawnId, WclDungeon } from '../data/types.ts'

export function urlToWclInfo(url: string) {
  if (!url.startsWith('http')) url = 'https://' + url

  const code = url.match(/\/reports\/(\w+)/)?.[1]
  if (!code)
    throw new Error(
      `Invalid warcraftlogs URL: missing report code. The URL have /reports/[code] in it.`,
    )

  const fightId = url.match(/fight=(\d+)/)?.[1]
  if (!fightId)
    throw new Error(
      `Invalid warcraftlogs URL: missing fight ID. Make sure you have a dungeon run selected. The URL must have fight=[number] in it.`,
    )

  return { code, fightId: Number(fightId) }
}

export function wclRouteToRoute(wclRoute: WclRoute) {
  const wclDungeonEntry = Object.entries(wclDungeons).find(
    ([_key, wclDungeon]) => wclDungeon?.encounterId === wclRoute.encounterID,
  )

  if (!wclDungeonEntry || !wclDungeonEntry[1])
    throw new Error(`This WCL dungeon is not yet supported by Threechest.`)

  const [dungeonKey, wclDungeon] = wclDungeonEntry as [DungeonKey, WclDungeon]

  let errors = false
  const route: Route = {
    uid: newRouteUid(),
    name: `WCL ${dungeonKey.toUpperCase()} +${wclRoute.keystoneLevel}`,
    dungeonKey: dungeonKey,
    pulls: wclRoute.dungeonPulls.map(({ enemyNPCs }, index) => ({
      id: index,
      spawns: enemyNPCs.flatMap(({ gameID, minimumInstanceID, maximumInstanceID }) => {
        const instanceIdToSpawnId = wclDungeon.gameIdToInstanceIdToSpawnIds[gameID]
        if (!instanceIdToSpawnId) {
          console.error(`Could not find gameId ${gameID} in ${dungeonKey} WCL data`)
          errors = true
          return []
        }

        const spawnIds: SpawnId[] = []
        for (let instanceId = minimumInstanceID; instanceId <= maximumInstanceID; ++instanceId) {
          const spawnId = instanceIdToSpawnId[instanceId]
          if (!spawnId) {
            errors = true
            console.error(`Could not find instanceId ${instanceId} in ${dungeonKey} WCL data`)
          } else {
            spawnIds.push(spawnId)
          }
        }

        return spawnIds
      }),
    })),
    notes: [],
    drawings: [],
  }

  return {
    route,
    errors,
  }
}
