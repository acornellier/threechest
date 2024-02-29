import { mdtRouteToRoute } from '../code/mdtUtil.ts'
import { Route } from '../code/types.ts'
import { DungeonKey } from './types.ts'
import dotiuMdtRoute from './mdtRoutes/dotiu_mdt_route.json'
import ebMdtRoute from './mdtRoutes/eb_mdt_route.json'

export const sampleRoutes: Record<DungeonKey, Route> = {
  eb: mdtRouteToRoute(ebMdtRoute),
  dotiu: mdtRouteToRoute(dotiuMdtRoute),
}
