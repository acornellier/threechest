import { Route, WclRoute } from './types.ts'
import { newRouteUid } from '../store/routes/routesReducer.ts'
import { dungeonsByKey } from '../data/dungeons.ts'

export function wclRouteToRoute(wclRoute: WclRoute): Route {
  const dungeonKey = 'eb'
  const dungeon = dungeonsByKey[dungeonKey]
  return {
    uid: newRouteUid(),
    name: 'WCL Route',
    dungeonKey: dungeonKey,
    pulls: wclRoute.dungeonPulls.map(({ enemyNPCs }, index) => ({
      id: index,
      spawns: enemyNPCs.flatMap(({ gameID, minimumInstanceID, maximumInstanceID }) => {
        const spawns = Object.values(dungeon.mobSpawns)
          .filter(
            ({ mob, spawn }) =>
              mob.id === gameID &&
              spawn.spawnIndex >= minimumInstanceID &&
              spawn.spawnIndex <= maximumInstanceID,
          )
          .map(({ spawn }) => spawn.id)

        console.log(spawns)
        return spawns
      }),
    })),
    notes: [],
    drawings: [],
  }
}
