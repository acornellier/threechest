import { Route } from './types.ts'
import { newRouteUid } from '../store/routes/routesReducer.ts'
import { wclDungeons } from '../data/wcl/wclData.ts'
import { DungeonKey, SpawnId, WclDungeon } from '../data/types.ts'
import { dungeonsByKey } from '../data/dungeons.ts'

export type WclPull = {
  enemyNPCs: Array<{
    id: number
    gameID: number
    minimumInstanceID: number
    maximumInstanceID: number
  }>
}

export type WclRoute = {
  encounterID: number
  keystoneLevel: number
  dungeonPulls: WclPull[]
}

export type WclEvent = {
  timestamp: number
  targetID: 1030
  targetInstance: 1
  x: -138398
  y: 52060
}

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
  const mobSpawns = Object.values(dungeonsByKey[dungeonKey].mobSpawns)

  const errors: string[] = []
  const route: Route = {
    uid: newRouteUid(),
    name: `WCL ${dungeonKey.toUpperCase()} +${wclRoute.keystoneLevel}`,
    dungeonKey: dungeonKey,
    pulls: wclRoute.dungeonPulls.map(({ enemyNPCs }, index) => ({
      id: index,
      spawns: enemyNPCs.flatMap(({ gameID, minimumInstanceID, maximumInstanceID }) => {
        const instanceIdToSpawnIndexes = wclDungeon.gameIdToInstanceIdToSpawnIndexes[gameID]
        if (!instanceIdToSpawnIndexes) {
          errors.push(`Could not find gameId ${gameID} in ${dungeonKey} WCL data`)
          return []
        }

        const spawnIds: SpawnId[] = []
        for (let instanceId = minimumInstanceID; instanceId <= maximumInstanceID; ++instanceId) {
          const spawnIndex = instanceIdToSpawnIndexes[instanceId]
          if (!spawnIndex) {
            errors.push(`Could not find instanceId ${instanceId} in ${dungeonKey} WCL data`)
          } else {
            const mobSpawn = mobSpawns.find(
              ({ mob, spawn }) => mob.id === gameID && spawn.spawnIndex === spawnIndex,
            )
            if (!mobSpawn) {
              errors.push(`Could not find enemy ${gameID}/${spawnIndex} in ${dungeonKey} MDT data`)
            } else {
              spawnIds.push(mobSpawn.spawn.id)
            }
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
