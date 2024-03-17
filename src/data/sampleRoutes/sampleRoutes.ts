import { SampleRoute } from '../../util/types.ts'
import { DungeonKey } from '../types.ts'
import { dungeons } from '../dungeons.ts'

const modules: Record<DungeonKey, Record<string, unknown>> = {
  aa: {},
  ad: {},
  bh: {},
  brh: {},
  dht: {},
  eb: import.meta.glob('./eb/*.json', { eager: true }),
  fall: {},
  nok: {},
  rise: {},
  tott: {},
  wcm: {},
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
