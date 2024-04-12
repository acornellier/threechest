import type { SampleRoute } from '../../util/types.ts'
import { dungeons } from '../dungeons.ts'
import type { DungeonKey } from '../dungeonKeys.ts'

const modules: Record<DungeonKey, Record<string, unknown>> = {
  av: import.meta.glob('./av/*.json', { eager: true }),
  hoi: import.meta.glob('./hoi/*.json', { eager: true }),
  nelth: import.meta.glob('./nelth/*.json', { eager: true }),
  rlp: import.meta.glob('./rlp/*.json', { eager: true }),
  uld: import.meta.glob('./uld/*.json', { eager: true }),
  aa: import.meta.glob('./aa/*.json', { eager: true }),
  ad: import.meta.glob('./ad/*.json', { eager: true }),
  bh: import.meta.glob('./bh/*.json', { eager: true }),
  brh: import.meta.glob('./brh/*.json', { eager: true }),
  dht: import.meta.glob('./dht/*.json', { eager: true }),
  eb: import.meta.glob('./eb/*.json', { eager: true }),
  fall: import.meta.glob('./fall/*.json', { eager: true }),
  nok: import.meta.glob('./nok/*.json', { eager: true }),
  rise: import.meta.glob('./rise/*.json', { eager: true }),
  tott: import.meta.glob('./tott/*.json', { eager: true }),
  wcm: import.meta.glob('./wcm/*.json', { eager: true }),
}

const difficultyToNum = (difficulty: SampleRoute['difficulty']) =>
  difficulty === 'beginner' ? 0 : difficulty === 'intermediate' ? 1 : 2

const affixToNum = (affix: SampleRoute['affix']) =>
  affix === undefined ? 0 : affix === 'fortified' ? 1 : 2

function sortSampleRoutes(route1: SampleRoute, route2: SampleRoute) {
  if (route1.difficulty !== route2.difficulty) {
    return difficultyToNum(route1.difficulty) - difficultyToNum(route2.difficulty)
  }

  if (route1.affix !== route2.affix) {
    return affixToNum(route1.affix) - affixToNum(route2.affix)
  }

  return route1.route.name.localeCompare(route2.route.name)
}

function importSampleRoutes(dungeonKey: DungeonKey) {
  return Object.values(modules[dungeonKey])
    .map((mod) => (mod as { default: SampleRoute }).default)
    .sort(sortSampleRoutes)
}

export const sampleRoutes = dungeons.reduce(
  (acc, { key }) => {
    acc[key] = importSampleRoutes(key)
    return acc
  },
  {} as Record<DungeonKey, SampleRoute[]>,
)
