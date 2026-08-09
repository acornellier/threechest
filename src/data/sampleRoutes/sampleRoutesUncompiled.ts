import type { SampleRoute } from '../../util/types.ts'
import { type DungeonKey, dungeonKeys } from '../dungeonKeys.ts'
import { decodeRoute } from '../../../server/decodeRoute'
import { mdtRouteToRoute } from '../../util/mdtUtil.ts'

type SampleRouteDefinition = Omit<SampleRoute, 'route'> & {
  mdt: string
  name?: string
}

const sampleRouteDefinitions: Record<DungeonKey, SampleRouteDefinition[]> = {
  fang: [],
  kr: [],
  murd: [],
  nalo: [],
  rlp: [],
  tos: [],
  vale: [],
  void: [],
}

async function convertRouteDefinition({ name, mdt }: SampleRouteDefinition): Promise<SampleRoute> {
  const mdtRoute = await decodeRoute(mdt)
  const route = mdtRouteToRoute(mdtRoute)

  if (name) route.name = name

  return {
    route,
  }
}

export type SampleRoutes = Record<DungeonKey, SampleRoute[]>

/**
 * Only the hand-curated "easy" routes are compiled in. The WCL-ranked routes are published to
 * blob storage by the sync-rankings workflow and fetched at runtime (see src/api/rankingsApi.ts),
 * so refreshing them no longer requires a rebuild.
 */
const easySampleRoutes = dungeonKeys.reduce((acc, key) => {
  acc[key as DungeonKey] = []
  return acc
}, {} as SampleRoutes)

for (const dungeonKey of dungeonKeys) {
  for (const routeDefinition of sampleRouteDefinitions[dungeonKey]) {
    const sampleRoute = await convertRouteDefinition(routeDefinition)
    easySampleRoutes[dungeonKey].push(sampleRoute)
  }
}

export default async () => ({
  data: easySampleRoutes,
})
